import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  UploadCloud,
  FileSpreadsheet,
  Brain,
  Calculator,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutDashboard,
  Building2,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { MenuItem } from '@/types/client'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

// 菜单配置：requiredScope 决定菜单在什么范围内可用
// - 'any': 任何情况下都可用
// - 'group': 仅在选择集团后可用
// - 'entity': 仅在选择实体后可用
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '工作台',
    shortLabel: '首页',
    icon: 'LayoutDashboard',
    description: '项目概览与待办事项',
    requiredScope: 'any',
  },
  {
    id: 'upload',
    label: '数据上传与解析',
    shortLabel: '数据上传',
    icon: 'UploadCloud',
    badge: 'AI',
    description: '上传财务报表，AI智能解析',
    requiredScope: 'entity',
  },
  {
    id: 'pillar-two',
    label: 'Pillar Two HKMTT',
    shortLabel: 'Pillar Two',
    icon: 'Calculator',
    badge: 'AI',
    description: '全球最低税率计算（集团级别）',
    requiredScope: 'group',
  },
  {
    id: 'profits-tax',
    label: '利得税计算',
    shortLabel: '利得税',
    icon: 'FileSpreadsheet',
    badge: 'AI',
    description: '香港利得税自动化计算（实体级别）',
    requiredScope: 'entity',
  },
  {
    id: 'return-filling',
    label: 'Return 自动填报',
    shortLabel: 'Return填报',
    icon: 'FileText',
    badge: 'AI',
    description: '税表自动填报与校验',
    requiredScope: 'entity',
  },
  {
    id: 'cover-letter',
    label: 'Cover Letter 生成',
    shortLabel: '信函生成',
    icon: 'Brain',
    badge: 'AI',
    description: '专业税务信函自动生成',
    requiredScope: 'any',
  },
  {
    id: 'export',
    label: '导出与交付',
    shortLabel: '导出交付',
    icon: 'Download',
    description: '全套交付物导出',
    requiredScope: 'any',
  },
]

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UploadCloud,
  Calculator,
  FileSpreadsheet,
  FileText,
  Brain,
  Download,
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { selectedGroup, selectedEntity } = useApp()

  // 确定当前选择范围
  const currentScope: 'any' | 'group' | 'entity' = selectedEntity
    ? 'entity'
    : selectedGroup
      ? 'group'
      : 'any'

  // 检查菜单是否可用
  const isMenuAvailable = (item: MenuItem) => {
    if (item.requiredScope === 'any') return true
    if (item.requiredScope === 'group') return currentScope === 'group' || currentScope === 'entity'
    if (item.requiredScope === 'entity') return currentScope === 'entity'
    return false
  }

  // 检查菜单是否被禁用（可见但不可点击）
  const isMenuDisabled = (item: MenuItem) => {
    return !isMenuAvailable(item)
  }

  // 获取禁用原因
  const getDisabledReason = (item: MenuItem) => {
    if (item.requiredScope === 'entity' && !selectedEntity) {
      return '请先选择实体'
    }
    if (item.requiredScope === 'group' && !selectedGroup) {
      return '请先选择集团'
    }
    return null
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shadow-elegant">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">HK Tax AI</span>
              <span className="text-xs text-muted-foreground">税务自动化平台</span>
            </div>
          )}
        </div>
      </div>

      {/* 当前选择状态指示 */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            {selectedGroup ? (
              selectedEntity ? (
                <span className="text-foreground">
                  {selectedGroup.name} / {selectedEntity.name}
                </span>
              ) : (
                <span className="text-foreground">
                  {selectedGroup.name} <span className="text-muted-foreground">(集团)</span>
                </span>
              )
            ) : (
              <span className="text-muted-foreground">未选择客户</span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const isActive = currentPage === item.id
          const disabled = isMenuDisabled(item)
          const disabledReason = getDisabledReason(item)

          return (
            <button
              key={item.id}
              onClick={() => !disabled && onNavigate(item.id)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left group relative',
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-muted/50',
                isActive && !disabled
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-muted-foreground hover:text-foreground border-l-4 border-transparent'
              )}
              title={disabledReason || undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && !disabled && 'text-primary')} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="ai" className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                    {disabled && disabledReason && (
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {disabled ? disabledReason : item.description}
                  </p>
                </div>
              )}

              {/* 悬浮提示（折叠状态下） */}
              {collapsed && disabled && disabledReason && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {disabledReason}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
