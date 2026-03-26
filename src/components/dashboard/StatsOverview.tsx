import { FolderKanban, CheckSquare, TrendingUp, Cpu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/types/dashboard'

interface StatsOverviewProps {
  stats: DashboardStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: '进行中项目',
      value: stats.activeProjects,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: '待办事项',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: '本周完成',
      value: stats.completedThisWeek,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'AI 处理中',
      value: stats.aiProcessing,
      icon: Cpu,
      color: 'text-info',
      bgColor: 'bg-info/10',
      pulse: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} hover>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  {item.value}
                  {item.pulse && (
                    <span className="inline-block w-2 h-2 ml-2 rounded-full bg-info animate-pulse" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
