import { useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  FileText,
  Brain,
  ArrowUp,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type {
  ReviewTask,
  ReviewTaskType,
  ReviewPriority,
  ReviewStatus,
} from '@/types/review'
import {
  startReview,
  approveReview,
  rejectReview,
  modifyReview,
  escalateReview,
  getReviewStatistics,
} from '@/lib/reviewService'

interface ReviewQueueProps {
  tasks: ReviewTask[]
  currentUserId?: string
  currentUserName?: string
  onTaskClick?: (task: ReviewTask) => void
  onRefresh?: () => void
}

const typeConfig: Record<ReviewTaskType, { label: string; icon: typeof AlertTriangle; color: string }> = {
  'new_business_line': { label: '新业务线', icon: FileText, color: 'text-info' },
  'low_confidence_match': { label: '低置信度匹配', icon: AlertCircle, color: 'text-warning' },
  'conflict_detected': { label: '冲突检测', icon: AlertTriangle, color: 'text-destructive' },
  'ai_adjustment': { label: 'AI 调整建议', icon: Brain, color: 'text-primary' },
  'data_validation': { label: '数据校验', icon: CheckCircle2, color: 'text-success' },
  'threshold_exceeded': { label: '阈值超标', icon: ArrowUp, color: 'text-destructive' },
  'manual_request': { label: '人工请求', icon: User, color: 'text-muted-foreground' },
}

const priorityConfig: Record<ReviewPriority, { label: string; color: string; bgColor: string }> = {
  'urgent': { label: '紧急', color: 'text-white', bgColor: 'bg-destructive' },
  'high': { label: '高', color: 'text-destructive', bgColor: 'bg-destructive/20' },
  'medium': { label: '中', color: 'text-warning', bgColor: 'bg-warning/20' },
  'low': { label: '低', color: 'text-muted-foreground', bgColor: 'bg-muted' },
}

const statusConfig: Record<ReviewStatus, { label: string; color: string }> = {
  'pending': { label: '待处理', color: 'text-warning' },
  'in_progress': { label: '处理中', color: 'text-primary' },
  'approved': { label: '已批准', color: 'text-success' },
  'rejected': { label: '已拒绝', color: 'text-destructive' },
  'escalated': { label: '已升级', color: 'text-destructive' },
  'completed': { label: '已完成', color: 'text-success' },
}

export function ReviewQueue({
  tasks,
  currentUserId = 'user-001',
  currentUserName = '税务专员',
  onTaskClick,
  onRefresh,
}: ReviewQueueProps) {
  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null)
  const [comment, setComment] = useState('')
  const [modifiedValue, setModifiedValue] = useState('')
  const [showModifyInput, setShowModifyInput] = useState(false)
  const stats = getReviewStatistics()

  const handleStartReview = (task: ReviewTask) => {
    startReview(task.id, currentUserId, currentUserName)
    onRefresh?.()
  }

  const handleApprove = (task: ReviewTask) => {
    approveReview(task.id, currentUserId, currentUserName, comment)
    setSelectedTask(null)
    setComment('')
    onRefresh?.()
  }

  const handleReject = (task: ReviewTask) => {
    if (!comment.trim()) {
      alert('请填写拒绝原因')
      return
    }
    rejectReview(task.id, currentUserId, currentUserName, comment)
    setSelectedTask(null)
    setComment('')
    onRefresh?.()
  }

  const handleModify = (task: ReviewTask) => {
    if (!modifiedValue.trim()) {
      alert('请填写修改后的值')
      return
    }
    modifyReview(task.id, currentUserId, currentUserName, modifiedValue, comment)
    setSelectedTask(null)
    setComment('')
    setModifiedValue('')
    setShowModifyInput(false)
    onRefresh?.()
  }

  const handleEscalate = (task: ReviewTask) => {
    if (!comment.trim()) {
      alert('请填写升级原因')
      return
    }
    escalateReview(task.id, currentUserId, currentUserName, comment)
    setSelectedTask(null)
    setComment('')
    onRefresh?.()
  }

  const formatTimeRemaining = (dueDate: Date): string => {
    const now = new Date()
    const diff = dueDate.getTime() - now.getTime()

    if (diff < 0) return '已逾期'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} 天`
    }
    return `${hours} 小时`
  }

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: '总计', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: '待处理', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: '处理中', value: stats.inProgress, icon: RefreshCw, color: 'text-primary' },
          { label: '已完成', value: stats.completed, icon: CheckCircle2, color: 'text-success' },
          { label: '已升级', value: stats.escalated, icon: ArrowUp, color: 'text-destructive' },
          { label: '逾期', value: stats.overdueCount, icon: AlertTriangle, color: 'text-destructive' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className={cn('text-2xl font-semibold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务列表 */}
        <div className="lg:col-span-2">
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    复核任务队列
                  </CardTitle>
                  <CardDescription>
                    {stats.pending} 个待处理任务
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success/50" />
                    <p>暂无复核任务</p>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const typeInfo = typeConfig[task.type]
                    const priorityInfo = priorityConfig[task.priority]
                    const statusInfo = statusConfig[task.status]
                    const isSelected = selectedTask?.id === task.id
                    const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed'

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-all',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                          isOverdue && 'border-destructive/50 bg-destructive/5'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn('text-xs', priorityInfo.bgColor, priorityInfo.color)}>
                                {priorityInfo.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <typeInfo.icon className={cn('w-3 h-3 mr-1', typeInfo.color)} />
                                {typeInfo.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>

                          {task.dueDate && (
                            <div className="text-right">
                              <span className={cn(
                                'text-xs',
                                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                              )}>
                                {formatTimeRemaining(task.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 项目和科目信息 */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {task.projectName && (
                            <span>项目: {task.projectName}</span>
                          )}
                          {task.accountCode && (
                            <span>科目: {task.accountCode}</span>
                          )}
                          {task.reviewer && (
                            <span>处理人: {task.reviewer}</span>
                          )}
                        </div>

                        {/* AI 置信度 */}
                        {task.aiConfidence !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">AI 置信度</span>
                              <span className={cn(
                                task.aiConfidence >= 0.9 ? 'text-success' :
                                task.aiConfidence >= 0.7 ? 'text-warning' : 'text-destructive'
                              )}>
                                {(task.aiConfidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={task.aiConfidence * 100}
                              className="h-1"
                            />
                          </div>
                        )}

                        {/* 操作按钮 */}
                        {task.status === 'pending' && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartReview(task)
                              }}
                            >
                              开始复核
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任务详情和操作 */}
        <div>
          {selectedTask ? (
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  复核操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 当前值和建议值 */}
                {selectedTask.currentValue !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">当前值</p>
                      <p className="font-medium">{selectedTask.currentValue}</p>
                    </div>
                    {selectedTask.suggestedValue !== undefined && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-primary mb-1">AI 建议</p>
                        <p className="font-medium text-primary">{selectedTask.suggestedValue}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 冲突详情 */}
                {selectedTask.conflictDetails && (
                  <div className={cn(
                    'p-3 rounded-lg',
                    selectedTask.conflictDetails.severity === 'high' ? 'bg-destructive/10 border border-destructive/20' :
                    selectedTask.conflictDetails.severity === 'medium' ? 'bg-warning/10 border border-warning/20' :
                    'bg-info/10 border border-info/20'
                  )}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={cn(
                        'w-4 h-4 mt-0.5',
                        selectedTask.conflictDetails.severity === 'high' ? 'text-destructive' :
                        selectedTask.conflictDetails.severity === 'medium' ? 'text-warning' : 'text-info'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{selectedTask.conflictDetails.type}</p>
                        <p className="text-xs text-muted-foreground">{selectedTask.conflictDetails.description}</p>
                        {selectedTask.conflictDetails.suggestedResolution && (
                          <p className="text-xs text-primary mt-1">{selectedTask.conflictDetails.suggestedResolution}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 评论输入 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">备注/原因</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入备注或拒绝原因..."
                    className="w-full p-3 rounded-lg border border-border bg-background resize-none h-20"
                  />
                </div>

                {/* 修改值输入 */}
                {showModifyInput && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">修改后的值</label>
                    <input
                      type="text"
                      value={modifiedValue}
                      onChange={(e) => setModifiedValue(e.target.value)}
                      placeholder="请输入修改后的值..."
                      className="w-full p-3 rounded-lg border border-border bg-background"
                    />
                  </div>
                )}

                {/* 操作按钮 */}
                {selectedTask.status === 'in_progress' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="default"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(selectedTask)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        批准
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedTask)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        拒绝
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowModifyInput(!showModifyInput)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      修改值
                    </Button>
                    {showModifyInput && (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleModify(selectedTask)}
                      >
                        确认修改
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => handleEscalate(selectedTask)}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      升级处理
                    </Button>
                  </div>
                )}

                {/* 已完成任务显示 */}
                {(selectedTask.status === 'approved' || selectedTask.status === 'rejected') && (
                  <div className={cn(
                    'p-4 rounded-lg text-center',
                    selectedTask.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  )}>
                    {selectedTask.status === 'approved' ? (
                      <><CheckCircle2 className="w-6 h-6 mx-auto mb-2" /> 此任务已批准</>
                    ) : (
                      <><XCircle className="w-6 h-6 mx-auto mb-2" /> 此任务已拒绝</>
                    )}
                    {selectedTask.decisionReason && (
                      <p className="text-sm text-muted-foreground mt-2">{selectedTask.decisionReason}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card hover className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">选择一个任务进行复核</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
