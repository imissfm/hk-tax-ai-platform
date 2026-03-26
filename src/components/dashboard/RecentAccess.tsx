import {
  Calculator,
  UploadCloud,
  FileText,
  Globe,
  Download,
  Brain,
  FileSpreadsheet,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { RecentAccessItem } from '@/types/dashboard'

interface RecentAccessProps {
  items: RecentAccessItem[]
  onNavigate?: (pageId: string) => void
}

const iconMap: Record<string, typeof Calculator> = {
  Calculator,
  UploadCloud,
  FileText,
  Globe,
  Download,
  Brain,
  FileSpreadsheet,
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

export function RecentAccess({ items, onNavigate }: RecentAccessProps) {
  return (
    <Card hover className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          最近访问
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => {
            const Icon = iconMap[item.icon] || Calculator
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.pageId)}
                className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(item.accessedAt)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
