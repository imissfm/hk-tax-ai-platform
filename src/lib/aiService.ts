// ============ AI 服务接口 ============
export interface AIServiceConfig {
  baseUrl?: string
  apiKey?: string
  model?: string
}

// ============ AI 建议类型 ============
export interface AISuggestion {
  id: string
  type: 'adjustment' | 'mapping' | 'validation' | 'year-replacement'
  field: string
  currentValue?: any
  suggestedValue: any
  confidence: number
  reason: string
  category?: string
  relatedAccounts?: string[]
  timestamp: Date
}

// ============ 税务调整建议 ============
export interface TaxAdjustmentSuggestion {
  id: string
  accountCode: string
  accountName: string
  originalValue: number
  suggestedValue: number
  adjustmentType: 'add-back' | 'deduction' | 'reclassification'
  reason: string
  taxRule: string
  confidence: number
  references?: string[]
}

// ============ 科目映射建议 ============
export interface AccountMappingSuggestion {
  id: string
  sourceAccount: string
  sourceName: string
  suggestedCategory: string
  suggestedCode: string
  confidence: number
  alternativeMappings: {
    category: string
    code: string
    confidence: number
  }[]
}

// ============ AI 服务类 ============
class AIService {
  private config: AIServiceConfig

  constructor(config?: AIServiceConfig) {
    this.config = {
      baseUrl: config?.baseUrl || '/api/ai',
      apiKey: config?.apiKey,
      model: config?.model || 'gpt-4',
    }
  }

  // ============ 生成税务调整建议 ============
  async generateAdjustmentSuggestions(
    data: { accountCode: string; accountName: string; value: number }[]
  ): Promise<TaxAdjustmentSuggestion[]> {
    // 模拟 AI 生成建议（实际应调用后端 API）
    const suggestions: TaxAdjustmentSuggestion[] = []

    const adjustmentRules = [
      {
        patterns: ['娱乐', 'entertainment', '应酬'],
        type: 'add-back' as const,
        rule: 'S.16(1) - 娱乐费用不可扣减',
        reason: '娱乐费用在计算利得税时需要加回',
      },
      {
        patterns: ['罚款', 'fine', 'penalty'],
        type: 'add-back' as const,
        rule: 'S.17 - 罚款不可扣减',
        reason: '罚款和罚金在计算利得税时需要加回',
      },
      {
        patterns: ['关联方利息', 'related party interest'],
        type: 'add-back' as const,
        rule: 'S.16(2) - 关联方利息限制',
        reason: '超过资本弱化规则的关联方利息需要加回',
      },
      {
        patterns: ['折旧', 'depreciation'],
        type: 'reclassification' as const,
        rule: 'S.39 - 折旧免税额',
        reason: '账面折旧需调整为税务折旧免税额',
      },
      {
        patterns: ['坏账准备', 'provision', 'allowance'],
        type: 'add-back' as const,
        rule: 'S.16(1)(d) - 准备金不可扣减',
        reason: '坏账准备在实际核销前不可扣减',
      },
    ]

    for (const item of data) {
      for (const rule of adjustmentRules) {
        const matched = rule.patterns.some(p =>
          item.accountName.toLowerCase().includes(p.toLowerCase())
        )

        if (matched) {
          suggestions.push({
            id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            accountCode: item.accountCode,
            accountName: item.accountName,
            originalValue: item.value,
            suggestedValue: rule.type === 'add-back' ? 0 : item.value,
            adjustmentType: rule.type,
            reason: rule.reason,
            taxRule: rule.rule,
            confidence: 0.85 + Math.random() * 0.1,
            references: [rule.rule],
          })
        }
      }
    }

    return suggestions
  }

  // ============ 生成年份替换建议 ============
  async generateYearReplacementSuggestion(
    sourceYear: string,
    data: { accountName: string }[]
  ): Promise<AISuggestion> {
    const targetYear = this.calculateTargetYear(sourceYear)

    return {
      id: `year-${Date.now()}`,
      type: 'year-replacement',
      field: 'fiscalYear',
      currentValue: sourceYear,
      suggestedValue: targetYear,
      confidence: 0.95,
      reason: `检测到财年 ${sourceYear}，建议替换为 ${targetYear}`,
      timestamp: new Date(),
    }
  }

  // ============ 计算目标年份 ============
  private calculateTargetYear(sourceYear: string): string {
    // 处理 2023/24 格式
    const hkMatch = sourceYear.match(/(\d{4})\/(\d{2})/)
    if (hkMatch) {
      const year = parseInt(hkMatch[1])
      return `${year + 1}/${(year + 2) % 100}`
    }

    // 处理 FY2024 格式
    const fyMatch = sourceYear.match(/FY(\d{2,4})/i)
    if (fyMatch) {
      const year = parseInt(fyMatch[1])
      if (fyMatch[1].length === 2) {
        return `FY${(year + 1) % 100}`
      }
      return `FY${year + 1}`
    }

    // 处理纯数字年份
    const numMatch = sourceYear.match(/(\d{4})/)
    if (numMatch) {
      const year = parseInt(numMatch[1])
      return `${year + 1}`
    }

    return sourceYear
  }

  // ============ 生成科目映射建议 ============
  async generateMappingSuggestions(
    accounts: { code: string; name: string }[]
  ): Promise<AccountMappingSuggestion[]> {
    const suggestions: AccountMappingSuggestion[] = []

    const categoryRules = [
      { patterns: ['银行', 'bank', '现金', 'cash'], category: '流动资产', codePrefix: '10' },
      { patterns: ['应收', 'receivable', 'AR'], category: '流动资产', codePrefix: '20' },
      { patterns: ['存货', 'inventory', 'stock'], category: '流动资产', codePrefix: '30' },
      { patterns: ['固定资产', 'fixed asset', 'PPE'], category: '非流动资产', codePrefix: '40' },
      { patterns: ['应付', 'payable', 'AP'], category: '流动负债', codePrefix: '50' },
      { patterns: ['贷款', 'loan', 'borrowing'], category: '非流动负债', codePrefix: '60' },
      { patterns: ['股本', 'share capital', 'equity'], category: '权益', codePrefix: '70' },
      { patterns: ['收入', 'revenue', 'sales'], category: '收入', codePrefix: '80' },
      { patterns: ['成本', 'cost', 'expense'], category: '支出', codePrefix: '90' },
    ]

    for (const account of accounts) {
      let matched = false

      for (const rule of categoryRules) {
        const isMatch = rule.patterns.some(p =>
          account.name.toLowerCase().includes(p.toLowerCase())
        )

        if (isMatch) {
          suggestions.push({
            id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceAccount: account.code,
            sourceName: account.name,
            suggestedCategory: rule.category,
            suggestedCode: `${rule.codePrefix}${account.code.slice(-3)}`,
            confidence: 0.88 + Math.random() * 0.1,
            alternativeMappings: [],
          })
          matched = true
          break
        }
      }

      if (!matched) {
        suggestions.push({
          id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceAccount: account.code,
          sourceName: account.name,
          suggestedCategory: '待分类',
          suggestedCode: `99${account.code.slice(-3)}`,
          confidence: 0.5,
          alternativeMappings: [],
        })
      }
    }

    return suggestions
  }

  // ============ 智能填充数字 ============
  async autoFillNumbers(
    context: {
      accountCode: string
      accountName: string
      lastYearValue?: number
      relatedData?: { [key: string]: number }
    }
  ): Promise<{
    suggestedValue: number
    confidence: number
    method: 'carry-forward' | 'calculated' | 'estimated'
    reason: string
  }> {
    // 如果有去年数据，使用结转方法
    if (context.lastYearValue !== undefined) {
      return {
        suggestedValue: context.lastYearValue,
        confidence: 0.9,
        method: 'carry-forward',
        reason: '基于去年数据结转',
      }
    }

    // 如果有相关数据，使用计算方法
    if (context.relatedData) {
      const values = Object.values(context.relatedData)
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        return {
          suggestedValue: avg,
          confidence: 0.7,
          method: 'calculated',
          reason: '基于相关科目平均值计算',
        }
      }
    }

    // 默认估计
    return {
      suggestedValue: 0,
      confidence: 0.3,
      method: 'estimated',
      reason: '无参考数据，建议人工输入',
    }
  }
}

// ============ 导出单例 ============
export const aiService = new AIService()
