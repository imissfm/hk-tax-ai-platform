import { Bell, AlertTriangle, Info, Settings, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/dashboard'

interface NotificationsProps {
  notifications: {
    urgent: Notification[]
    system: Notification[]
  }
  onNavigate?: (pageId: string) => void
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  return date.toLocaleDateString('zh-CN')
}

function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: Notification
  onNavigate?: (pageId: string) => void
}) {
  const iconMap = {
    urgent: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    system: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' },
    info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
  }

  const config = iconMap[notification.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        notification.read ? 'opacity-60' : 'hover:bg-muted/50'
      )}
    >
      <div className={cn('p-2 rounded-lg', config.bg)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
          {notification.actionLabel && notification.actionPageId && (
            <button
              onClick={() => onNavigate?.(notification.actionPageId)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {notification.actionLabel}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Notifications({ notifications, onNavigate }: NotificationsProps) {
  const unreadCount = [...notifications.urgent, ...notifications.system].filter(n => !n.read).length

  return (
    <Card hover className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          提醒与通知
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 紧急事项 */}
        {notifications.urgent.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              紧急事项
            </h4>
            <div className="space-y-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
              {notifications.urgent.map((n) => (
                <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {/* 系统通知 */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            系统通知
          </h4>
          <div className="space-y-2">
            {notifications.system.slice(0, 3).map((n) => (
              <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
