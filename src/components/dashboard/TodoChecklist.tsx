import { useState } from 'react'
import {
  Brain,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { TodoItem, TodoCategory } from '@/types/dashboard'

interface TodoChecklistProps {
  todos: {
    aiReview: TodoItem[]
    dataMissing: TodoItem[]
    deadline: TodoItem[]
    approval: TodoItem[]
  }
  onNavigate?: (pageId: string) => void
  onToggleComplete?: (todoId: string, completed: boolean) => void
}

const priorityConfig = {
  urgent: { label: '紧急', color: 'bg-destructive', textColor: 'text-destructive' },
  high: { label: '高', color: 'bg-warning', textColor: 'text-warning' },
  medium: { label: '中', color: 'bg-info', textColor: 'text-info' },
  low: { label: '低', color: 'bg-muted-foreground', textColor: 'text-muted-foreground' },
}

const tabConfig: { value: TodoCategory; label: string; icon: typeof Brain }[] = [
  { value: 'ai-review', label: 'AI 审核', icon: Brain },
  { value: 'data-missing', label: '数据缺失', icon: AlertCircle },
  { value: 'deadline', label: '期限提醒', icon: Clock },
  { value: 'approval', label: '审批流转', icon: Users },
]

function TodoItemRow({
  todo,
  onNavigate,
  onToggleComplete,
}: {
  todo: TodoItem
  onNavigate?: (pageId: string) => void
  onToggleComplete?: (todoId: string, completed: boolean) => void
}) {
  const priority = priorityConfig[todo.priority]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-l-2 transition-colors',
        priority.color.replace('bg-', 'border-'),
        todo.completed ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete?.(todo.id, !todo.completed)}
        className="mt-0.5"
      >
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center',
            todo.completed
              ? 'bg-success border-success'
              : 'border-muted-foreground hover:border-primary'
          )}
        >
          {todo.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm font-medium',
              todo.completed && 'line-through'
            )}
          >
            {todo.title}
          </p>
          <Badge variant="outline" className="text-xs">
            {priority.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {todo.description}
        </p>
        <div className="flex items-center gap-3 mt-2">
          {todo.projectName && (
            <Badge variant="secondary" className="text-xs">
              {todo.projectName}
            </Badge>
          )}
          {todo.dueDate && (
            <span className="text-xs text-muted-foreground">
              截止: {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
            </span>
          )}
          {todo.assignee && (
            <span className="text-xs text-muted-foreground">
              等待: {todo.assignee}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      {todo.pageId && !todo.completed && (
        <button
          onClick={() => onNavigate?.(todo.pageId)}
          className="p-1 hover:bg-muted rounded"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

export function TodoChecklist({ todos, onNavigate, onToggleComplete }: TodoChecklistProps) {
  const [activeTab, setActiveTab] = useState<TodoCategory>('ai-review')

  const todoMap = {
    'ai-review': todos.aiReview,
    'data-missing': todos.dataMissing,
    'deadline': todos.deadline,
    'approval': todos.approval,
  }

  const getPendingCount = (items: TodoItem[]) =>
    items.filter((t) => !t.completed).length

  return (
    <Card hover className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
          待办事项
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TodoCategory)}>
          <TabsList className="w-full grid grid-cols-4">
            {tabConfig.map((tab) => {
              const count = getPendingCount(todoMap[tab.value])
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  <tab.icon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {todoMap[tab.value].length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    暂无待办事项
                  </div>
                ) : (
                  todoMap[tab.value].map((todo) => (
                    <TodoItemRow
                      key={todo.id}
                      todo={todo}
                      onNavigate={onNavigate}
                      onToggleComplete={onToggleComplete}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
