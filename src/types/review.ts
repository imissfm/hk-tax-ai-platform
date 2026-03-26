// ============ 复核任务类型 ============
export type ReviewTaskType =
  | 'new_business_line'      // 新业务线
  | 'low_confidence_match'   // 低置信度匹配
  | 'conflict_detected'      // 冲突检测
  | 'ai_adjustment'          // AI 调整建议
  | 'data_validation'        // 数据校验
  | 'threshold_exceeded'     // 阈值超标
  | 'manual_request'         // 用户请求

// ============ 复核任务优先级 ============
export type ReviewPriority = 'urgent' | 'high' | 'medium' | 'low'

// ============ 复核任务状态 ============
export type ReviewStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated' | 'completed'

// ============ 复核任务 ============
export interface ReviewTask {
  id: string
  type: ReviewTaskType
  priority: ReviewPriority
  status: ReviewStatus
  title: string
  description: string

  // 关联信息
  projectId?: string
  projectName?: string
  accountId?: string
  accountCode?: string
  field?: string

  // 数据详情
  currentValue?: any
  suggestedValue?: any
  aiConfidence?: number
  conflictDetails?: ConflictDetails

  // 时间信息
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  completedAt?: Date

  // 人员信息
  createdBy?: string
  assignee?: string
  reviewer?: string

  // 决策信息
  decision?: 'approve' | 'reject' | 'modify' | 'escalate'
  decisionReason?: string
  modifiedValue?: any
}

// ============ 冲突详情 ============
export interface ConflictDetails {
  type: 'category_mismatch' | 'year_mismatch' | 'value_drift' | 'semantic_drift' | 'duplicate_match'
  severity: 'low' | 'medium' | 'high'
  description: string
  relatedRecords?: string[]
  suggestedResolution?: string
}

// ============ 复核工作流 ============
export interface ReviewWorkflow {
  id: string
  name: string
  description: string
  steps: ReviewWorkflowStep[]
  isActive: boolean
}

export interface ReviewWorkflowStep {
    id: string
    name: string
    order: number
    assigneeRole?: string
    isOptional: boolean
    timeout?: number  // hours
}

// ============ 复核统计 ============
export interface ReviewStatistics {
  total: number
  pending: number
  inProgress: number
  completed: number
  escalated: number
  byType: Record<ReviewTaskType, number>
  byPriority: Record<ReviewPriority, number>
  averageCompletionTime?: number  // hours
  overdueCount: number
}

// ============ 复核决策记录 ============
export interface ReviewDecision {
  id: string
  taskId: string
  userId: string
  userName: string
  action: 'approved' | 'rejected' | 'modified' | 'escalated' | 'commented'
  comment?: string
  previousValue?: any
  newValue?: any
  timestamp: Date
}

// ============ 复核队列配置 ============
export interface ReviewQueueConfig {
  autoAssign: boolean
  defaultAssignee?: string
  escalationThreshold: number  // hours without action
  notificationEnabled: boolean
  reminderInterval: number  // hours before due
}
