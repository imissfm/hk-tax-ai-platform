# 香港税务AI平台 - 详细需求规格

## 1. 信息收集环节 (Data Collection)

### 1.1 基于去年信息生成年份 Info List（替换年份）

#### 输入类型支持
| 类型 | 说明 | 优先级 |
|------|------|--------|
| 账套格式 | Excel/CSV 上传 | P0 |
| TB 模板 | 预设的税务表格模板 | P1 |
| Aura 接口 | 通过 API 从 Aura 系统导入 | P2 |

#### 年份替换处理
- 跨会计准则年份命名：`FY2024` → `FY2025`
- 跨地区年份差异：香港 `2023/24` → 新加坡 `FY2024`
- 自动检测年份格式并提示用户确认

#### 人工校验点
- 触发条件：新业务线在去年数据中无参照记录
- 系统行为：高亮显示 + 提示「需要人工确认新业务分类」
- 用户操作：可选择新建分类或映射到现有分类

---

## 2. 税务计算环节 (Tax Computation)

### 2.1 Auto fill numbers based on A/cs + TB + Aura + info

#### AI 调整建议处理
| 功能 | 说明 |
|------|------|
| AI 建议 | 系统自动生成调整项建议 |
| 人工推翻 | 用户可修改/拒绝 AI 建议 |
| 操作留痕 | 记录原始值、AI建议值、最终值、操作人、时间戳 |
| 复核路径 | 关键数字（如应纳税额 > 100万）需二次确认 |

#### 数据字段映射
```
A/s (Trial Balance) → 税务调整项
TB (Tax Base)      → 计算基础
Aura (External)    → 参考数据
```

---

## 3. 报表填报环节 (E-Filing)

### 3.1 Basic Info + Additional Info 填充

#### 场景：NO WP (Without Precedent) / c/f last year description

##### NO WP 默认描述库
| 税种 | 地区 | 默认描述模板 |
|------|------|--------------|
| 利得税 | 香港 | "本行主要从事[业务类型]，[补充描述]" |
| 薪俸税 | 香港 | "雇主提供的住房福利" |
| Pillar Two | 全球 | "符合GloBE规则的税务调整" |

##### c/f (Compared From) 语义匹配
| 算法选项 | 适用场景 | 准确度 |
|----------|----------|--------|
| 余弦相似度 | 简单文本匹配 | 中等 |
| BERT 语义 | 复杂语义理解 | 高 |
| 规则匹配 | 固定格式 | 最高 |

##### 冲突仲裁流程
```
1. 系统检测：今年业务数据 vs 去年描述 → 差异超过阈值
2. 提示用户：显示差异对比，标注冲突字段
3. 用户选择：
   - 采纳今年数据（更新描述）
   - 保留去年描述（忽略新数据）
   - 人工输入新描述
4. 记录决策：保存仲裁结果和理由
```

### 3.2 Mandatory Tag 填充（replace with CY no.）

##### 合规清单来源
| 来源 | 说明 | 实现方式 |
|------|------|----------|
| 税局公开文档 | IRD 官方表格说明 | PDF 解析 + 结构化存储 |
| 合规数据库订阅 | 第三方合规服务 | API 集成 |
| 内部知识库 | 公司积累的合规规则 | 数据库存储 |

##### CY 编号与 Tag 关联规则
```
CY 编号格式: CY{税种代码}{年份}{序号}
示例: CYPT2024001 (利得税 2024 第1号)

关联优先级:
1. 精确匹配: CY 编号直接对应
2. 业务类型匹配: 按业务类型推荐 CY 编号
3. 金额范围匹配: 按金额区间推荐
```

##### 多税种交叉标记冲突检测
```
冲突场景:
- 同一笔收入被标记为多个税种
- 调整项同时影响利得税和 Pillar Two

检测机制:
1. 实时检测: 填写时即时预警
2. 批量检测: 提交前全表扫描
3. 解决建议: 自动推荐优先级或提示人工选择
```

---

## 4. 技术实现建议

### 4.1 数据存储
```typescript
// 操作留痕记录
interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: 'AI_SUGGEST' | 'USER_OVERRIDE' | 'MANUAL_INPUT' | 'CONFLICT_RESOLVED'
  field: string
  oldValue?: any
  aiValue?: any
  newValue: any
  reason?: string
}
```

### 4.2 冲突检测配置
```typescript
interface ConflictRule {
  id: string
  name: string
  condition: (current: any, previous: any) => boolean
  threshold: number
  severity: 'warning' | 'error'
  suggestion: string
}
```

### 4.3 人工复核流程
```typescript
interface ReviewTask {
  id: string
  type: 'NEW_BUSINESS_LINE' | 'CONFLICT' | 'THRESHOLD_EXCEEDED' | 'AI_LOW_CONFIDENCE'
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  assignee: string
  deadline: Date
  relatedRecords: string[]
}
```

---

## 5. 实施优先级

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| P0 | 账套格式上传 + 基础 AI 填充 | 必须 |
| P0 | 操作留痕记录 | 必须 |
| P1 | c/f 语义匹配（基础版） | 高 |
| P1 | 人工复核流程 | 高 |
| P2 | Aura API 集成 | 中 |
| P2 | BERT 语义匹配 | 中 |
| P3 | 合规数据库订阅 | 低 |
