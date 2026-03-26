import type {
  ReviewTask,
  ReviewTaskType,
  ReviewStatus,
  ReviewPriority,
  ReviewDecision,
  ReviewStatistics,
  ConflictDetails,
} from '@/types/review'
import { logAudit } from './auditLog'

// ============ 内存存储（生产环境应使用数据库） ============
let reviewTasks: ReviewTask[] = []
let reviewDecisions: ReviewDecision[] = []

// ============ 生成唯一 ID ============
function generateId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============ 创建复核任务 ============
export function createReviewTask(
  type: ReviewTaskType,
  title: string,
  description: string,
  options: {
    priority?: ReviewPriority
    projectId?: string
    projectName?: string
    accountId?: string
    accountCode?: string
    field?: string
    currentValue?: any
    suggestedValue?: any
    aiConfidence?: number
    conflictDetails?: ConflictDetails
    assignee?: string
    dueDate?: Date
    createdBy?: string
  } = {}
): ReviewTask {
  const now = new Date()

  // 根据类型确定默认优先级
  const defaultPriority: ReviewPriority = getPriorityByType(type)

  const task: ReviewTask = {
    id: generateId(),
    type,
    priority: options.priority || defaultPriority,
    status: 'pending',
    title,
    description,
    projectId: options.projectId,
    projectName: options.projectName,
    accountId: options.accountId,
    accountCode: options.accountCode,
    field: options.field,
    currentValue: options.currentValue,
    suggestedValue: options.suggestedValue,
    aiConfidence: options.aiConfidence,
    conflictDetails: options.conflictDetails,
    createdAt: now,
    updatedAt: now,
    dueDate: options.dueDate || calculateDueDate(options.priority || defaultPriority),
    createdBy: options.createdBy,
    assignee: options.assignee,
  }

  reviewTasks.push(task)

  // 记录审计日志
  logAudit('VALIDATION', {
    taskId: task.id,
    taskType: type,
    title,
    reason: '创建复核任务',
  })

  return task
}

// ============ 根据类型获取默认优先级 ============
function getPriorityByType(type: ReviewTaskType): ReviewPriority {
  const priorityMap: Record<ReviewTaskType, ReviewPriority> = {
    'new_business_line': 'medium',
    'low_confidence_match': 'low',
    'conflict_detected': 'high',
    'ai_adjustment': 'medium',
    'data_validation': 'high',
    'threshold_exceeded': 'urgent',
    'manual_request': 'medium',
  }
  return priorityMap[type] || 'medium'
}

// ============ 计算截止日期 ============
function calculateDueDate(priority: ReviewPriority): Date {
  const now = new Date()
  const hoursMap: Record<ReviewPriority, number> = {
    'urgent': 4,
    'high': 24,
    'medium': 72,
    'low': 168,
  }
  return new Date(now.getTime() + hoursMap[priority] * 60 * 60 * 1000)
}

// ============ 获取复核任务 ============
export function getReviewTask(taskId: string): ReviewTask | undefined {
  return reviewTasks.find(t => t.id === taskId)
}

// ============ 获取待复核任务列表 ============
export function getPendingReviewTasks(options?: {
  assignee?: string
  projectId?: string
  priority?: ReviewPriority
  type?: ReviewTaskType
}): ReviewTask[] {
  return reviewTasks.filter(task => {
    if (task.status === 'completed' || task.status === 'rejected') return false
    if (options?.assignee && task.assignee !== options.assignee) return false
    if (options?.projectId && task.projectId !== options.projectId) return false
    if (options?.priority && task.priority !== options.priority) return false
    if (options?.type && task.type !== options.type) return false
    return true
  }).sort((a, b) => {
    // 按优先级排序
    const priorityOrder: Record<ReviewPriority, number> = {
      'urgent': 0, 'high': 1, 'medium': 2, 'low': 3,
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    // 同优先级按创建时间
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
}

// ============ 开始复核 ============
export function startReview(taskId: string, reviewerId: string, reviewerName: string): ReviewTask | null {
  const task = reviewTasks.find(t => t.id === taskId)
  if (!task || task.status !== 'pending') return null

  task.status = 'in_progress'
  task.reviewer = reviewerName
  task.updatedAt = new Date()

  logAudit('VALIDATION', {
    taskId,
    field: 'status',
    oldValue: 'pending',
    newValue: 'in_progress',
    reason: `${reviewerName} 开始复核`,
  }, reviewerId, reviewerName)

  return task
}

// ============ 完成复核 - 批准 ============
export function approveReview(
  taskId: string,
  userId: string,
  userName: string,
  comment?: string
): ReviewTask | null {
  const task = reviewTasks.find(t => t.id === taskId)
  if (!task || task.status !== 'in_progress') return null

  task.status = 'approved'
  task.decision = 'approve'
  task.decisionReason = comment
  task.completedAt = new Date()
  task.updatedAt = new Date()

  // 记录决策
  const decision: ReviewDecision = {
    id: generateId(),
    taskId,
    userId,
    userName,
    action: 'approved',
    comment,
    previousValue: task.currentValue,
    newValue: task.suggestedValue,
    timestamp: new Date(),
  }
  reviewDecisions.push(decision)

  logAudit('USER_OVERRIDE', {
    taskId,
    field: task.field,
    oldValue: task.currentValue,
    newValue: task.suggestedValue,
    aiValue: task.suggestedValue,
    reason: comment || '复核批准',
  }, userId, userName)

  return task
}

// ============ 完成复核 - 拒绝 ============
export function rejectReview(
  taskId: string,
  userId: string,
  userName: string,
  reason: string
): ReviewTask | null {
  const task = reviewTasks.find(t => t.id === taskId)
  if (!task || task.status !== 'in_progress') return null

  task.status = 'rejected'
  task.decision = 'reject'
  task.decisionReason = reason
  task.completedAt = new Date()
  task.updatedAt = new Date()

  const decision: ReviewDecision = {
    id: generateId(),
    taskId,
    userId,
    userName,
    action: 'rejected',
    comment: reason,
    previousValue: task.currentValue,
    timestamp: new Date(),
  }
  reviewDecisions.push(decision)

  logAudit('USER_OVERRIDE', {
    taskId,
    field: task.field,
    oldValue: task.suggestedValue,
    newValue: task.currentValue,
    aiValue: task.suggestedValue,
    reason,
  }, userId, userName)

  return task
}

// ============ 完成复核 - 修改 ============
export function modifyReview(
  taskId: string,
  userId: string,
  userName: string,
  modifiedValue: any,
  comment?: string
): ReviewTask | null {
  const task = reviewTasks.find(t => t.id === taskId)
  if (!task || task.status !== 'in_progress') return null

  task.status = 'completed'
  task.decision = 'modify'
  task.decisionReason = comment
  task.modifiedValue = modifiedValue
  task.completedAt = new Date()
  task.updatedAt = new Date()

  const decision: ReviewDecision = {
    id: generateId(),
    taskId,
    userId,
    userName,
    action: 'modified',
    comment,
    previousValue: task.currentValue,
    newValue: modifiedValue,
    timestamp: new Date(),
  }
  reviewDecisions.push(decision)

  logAudit('MANUAL_INPUT', {
    taskId,
    field: task.field,
    newValue: modifiedValue,
    reason: comment || '复核修改',
  }, userId, userName)

  return task
}

// ============ 升级复核 ============
export function escalateReview(
  taskId: string,
  userId: string,
  userName: string,
  reason: string,
  escalateTo?: string
): ReviewTask | null {
  const task = reviewTasks.find(t => t.id === taskId)
  if (!task || task.status === 'completed') return null

  task.status = 'escalated'
  task.decision = 'escalate'
  task.decisionReason = reason
  task.priority = 'urgent'
  if (escalateTo) task.assignee = escalateTo
  task.updatedAt = new Date()

  const decision: ReviewDecision = {
    id: generateId(),
    taskId,
    userId,
    userName,
    action: 'escalated',
    comment: reason,
    timestamp: new Date(),
  }
  reviewDecisions.push(decision)

  logAudit('VALIDATION', {
    taskId,
    field: 'status',
    oldValue: task.status,
    newValue: 'escalated',
    reason: `升级至 ${escalateTo || '上级'}`,
  }, userId, userName)

  return task
}

// ============ 获取复核统计 ============
export function getReviewStatistics(): ReviewStatistics {
  const now = new Date()

  const stats: ReviewStatistics = {
    total: reviewTasks.length,
    pending: reviewTasks.filter(t => t.status === 'pending').length,
    inProgress: reviewTasks.filter(t => t.status === 'in_progress').length,
    completed: reviewTasks.filter(t => t.status === 'approved' || t.status === 'completed').length,
    escalated: reviewTasks.filter(t => t.status === 'escalated').length,
    byType: {
      'new_business_line': 0,
      'low_confidence_match': 0,
      'conflict_detected': 0,
      'ai_adjustment': 0,
      'data_validation': 0,
      'threshold_exceeded': 0,
      'manual_request': 0,
    },
    byPriority: {
      'urgent': 0,
      'high': 0,
      'medium': 0,
      'low': 0,
    },
    overdueCount: 0,
  }

  let totalCompletionTime = 0
  let completedWithTime = 0

  for (const task of reviewTasks) {
    stats.byType[task.type]++
    stats.byPriority[task.priority]++

    // 计算逾期
    if (task.dueDate && task.status !== 'completed' && task.status !== 'rejected') {
      if (now > task.dueDate) {
        stats.overdueCount!++
      }
    }

    // 计算平均完成时间
    if (task.completedAt) {
      const completionTime = (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60)
      totalCompletionTime += completionTime
      completedWithTime++
    }
  }

  if (completedWithTime > 0) {
    stats.averageCompletionTime = totalCompletionTime / completedWithTime
  }

  return stats
}

// ============ 获取任务决策历史 ============
export function getTaskDecisionHistory(taskId: string): ReviewDecision[] {
  return reviewDecisions.filter(d => d.taskId === taskId)
}

// ============ 批量创建复核任务 ============
export function batchCreateReviewTasks(
  items: Array<{
    type: ReviewTaskType
    title: string
    description: string
    options?: Parameters<typeof createReviewTask>[3]
  }>
): ReviewTask[] {
  return items.map(item => createReviewTask(item.type, item.title, item.description, item.options))
}

// ============ 清除所有任务（测试用） ============
export function clearReviewTasks(): void {
  reviewTasks = []
  reviewDecisions = []
}
