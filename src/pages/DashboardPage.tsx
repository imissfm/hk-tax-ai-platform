import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import {
  StatsOverview,
  ProjectProgress,
  RecentAccess,
  TodoChecklist,
  Notifications,
} from '@/components/dashboard'
import { mockDashboardData } from '@/data/mockDashboard'
import type { TodoItem } from '@/types/dashboard'

interface DashboardPageProps {
  onNavigate?: (pageId: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [todos, setTodos] = useState(mockDashboardData.todos)

  const handleToggleComplete = (todoId: string, completed: boolean) => {
    setTodos((prev) => ({
      aiReview: prev.aiReview.map((t) =>
        t.id === todoId ? { ...t, completed } : t
      ),
      dataMissing: prev.dataMissing.map((t) =>
        t.id === todoId ? { ...t, completed } : t
      ),
      deadline: prev.deadline.map((t) =>
        t.id === todoId ? { ...t, completed } : t
      ),
      approval: prev.approval.map((t) =>
        t.id === todoId ? { ...t, completed } : t
      ),
    }))
  }

  const currentTime = new Date()
  const hour = currentTime.getHours()
  let greeting = '早上好'
  if (hour >= 12 && hour < 18) {
    greeting = '下午好'
  } else if (hour >= 18) {
    greeting = '晚上好'
  }

  return (
    <div className="min-h-screen">
      <Header
        title={`${greeting}，税务专员`}
        subtitle="香港税务AI自动化平台"
        rightContent={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI 已就绪</span>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* 核心指标 */}
        <StatsOverview stats={mockDashboardData.stats} />

        {/* 项目进度 + 最近访问 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectProgress
              projects={mockDashboardData.projects}
              onNavigate={onNavigate}
            />
          </div>
          <div>
            <RecentAccess
              items={mockDashboardData.recentAccess}
              onNavigate={onNavigate}
            />
          </div>
        </div>

        {/* 待办事项 + 通知 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodoChecklist
              todos={todos}
              onNavigate={onNavigate}
              onToggleComplete={handleToggleComplete}
            />
          </div>
          <div>
            <Notifications
              notifications={mockDashboardData.notifications}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
