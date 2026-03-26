// ============ 核心指标 ============
export interface DashboardStats {
  activeProjects: number      // 进行中项目数
  pendingTasks: number        // 待办事项数
  completedThisWeek: number   // 本周完成数
  aiProcessing: number        // AI 处理中任务数
}

// ============ 项目进度 ============
export interface Project {
  id: string
  groupId: string                 // 所属集团ID
  entityId?: string               // 所属实体ID（如果是实体级别项目）
  clientName: string              // 客户名称
  projectName: string             // 项目名称 (如: "2024年度税务申报")
  fiscalYear: string              // 财政年度
  overallProgress: number         // 总体进度 0-100
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed'

  // 税务工作流进度
  workflows: {
    pillarTwo: WorkflowStatus     // Pillar Two HKMTT
    profitsTax: WorkflowStatus    // 利得税计算
    returnFilling: WorkflowStatus // Return 填报
  }

  // 功能模块进度
  modules: {
    dataUpload: ModuleStatus      // 数据上传
    aiParsing: ModuleStatus       // AI 解析
    exportDelivery: ModuleStatus  // 导出交付
  }

  updatedAt: string               // 最后更新时间
  deadline?: string               // 申报截止日期
}

export interface WorkflowStatus {
  status: 'pending' | 'in-progress' | 'review' | 'completed'
  progress: number                // 0-100
  hasIssues: boolean              // 是否有问题需要处理
}

export interface ModuleStatus {
  status: 'pending' | 'completed' | 'error'
  completedAt?: string
}

// ============ 最近访问 ============
export interface RecentAccessItem {
  id: string
  type: 'project' | 'page'        // 项目 or 页面
  title: string
  subtitle?: string
  pageId: string                  // 对应的页面ID (用于导航)
  projectId?: string              // 如果是项目，项目ID
  groupId?: string                // 所属集团ID
  entityId?: string               // 所属实体ID
  accessedAt: string
  icon: string                    // lucide-react icon name
}

// ============ 待办事项 ============
export type TodoCategory = 'ai-review' | 'data-missing' | 'deadline' | 'approval'

export interface TodoItem {
  id: string
  category: TodoCategory
  title: string
  description: string
  priority: 'urgent' | 'high' | 'medium' | 'low'

  // 关联信息
  groupId?: string                // 所属集团ID
  entityId?: string               // 所属实体ID
  projectId?: string
  projectName?: string
  pageId?: string                 // 点击跳转的页面

  // 时间相关
  dueDate?: string
  createdAt: string

  // 状态
  completed: boolean
  assignee?: string               // 如果是审批类，等待谁处理
}

// ============ 通知提醒 ============
export interface Notification {
  id: string
  type: 'urgent' | 'system' | 'info'
  title: string
  message: string
  createdAt: string
  read: boolean

  // 关联信息（可选）
  groupId?: string
  entityId?: string

  // 可选操作
  actionLabel?: string
  actionPageId?: string
}

// ============ Dashboard 整体数据 ============
export interface DashboardData {
  stats: DashboardStats
  projects: Project[]
  recentAccess: RecentAccessItem[]
  todos: {
    aiReview: TodoItem[]
    dataMissing: TodoItem[]
    deadline: TodoItem[]
    approval: TodoItem[]
  }
  notifications: {
    urgent: Notification[]
    system: Notification[]
  }
}
