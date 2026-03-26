import { useState, useMemo } from 'react'
import { Sparkles, Building2, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import {
  StatsOverview,
  ProjectProgress,
  RecentAccess,
  TodoChecklist,
  Notifications,
} from '@/components/dashboard'
import { getFilteredData } from '@/data/mockDashboard'
import { useApp } from '@/context/AppContext'
import type { TodoItem } from '@/types/dashboard'

interface DashboardPageProps {
  onNavigate?: (pageId: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { selectedGroupId, selectedEntityId, selectedGroup, selectedEntity } = useApp()

  // 根据选择的集团/实体获取过滤后的数据
  const dashboardData = useMemo(() => {
    return getFilteredData(selectedGroupId, selectedEntityId)
  }, [selectedGroupId, selectedEntityId])

  const [todos, setTodos] = useState(dashboardData.todos)

  // 当选择变化时更新 todos
  useMemo(() => {
    setTodos(dashboardData.todos)
  }, [dashboardData.todos])

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

  // 根据选择生成标题
  const getTitle = () => {
    if (selectedEntity) {
      return selectedEntity.name
    }
    if (selectedGroup) {
      return selectedGroup.name
    }
    return `${greeting}，税务专员`
  }

  // 根据选择生成副标题
  const getSubtitle = () => {
    if (selectedEntity) {
      return `${selectedGroup?.name || ''} / ${selectedEntity.jurisdiction.name}`
    }
    if (selectedGroup) {
      return `${selectedGroup.industry || ''} · ${selectedGroup.pillarTwoStatus?.isApplicable ? 'Pillar Two 适用' : 'Pillar Two 不适用'}`
    }
    return '香港税务AI自动化平台'
  }

  return (
    <div className="min-h-screen">
      <Header
        title={getTitle()}
        subtitle={getSubtitle()}
        rightContent={
          <div className="flex items-center gap-4">
            {/* 当前选择状态指示 */}
            {selectedGroup && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                {selectedEntity ? (
                  <>
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {selectedEntity.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {selectedGroup.name} (集团视图)
                    </span>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>AI 已就绪</span>
            </div>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* 空状态提示 */}
        {!selectedGroup && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">请选择客户</h3>
            <p className="text-muted-foreground text-sm">
              在顶部选择集团或实体，以查看相关项目数据
            </p>
          </div>
        )}

        {/* 核心指标 */}
        <StatsOverview stats={dashboardData.stats} />

        {/* 项目进度 + 最近访问 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectProgress
              projects={dashboardData.projects}
              onNavigate={onNavigate}
            />
          </div>
          <div>
            <RecentAccess
              items={dashboardData.recentAccess}
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
              notifications={dashboardData.notifications}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
