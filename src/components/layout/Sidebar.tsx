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
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutDashboard,
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  {
    id: 'dashboard',
    label: '工作台',
    shortLabel: '首页',
    icon: LayoutDashboard,
    badge: null,
    description: '项目概览与待办事项',
  },
  {
    id: 'upload',
    label: '数据上传与解析',
    shortLabel: '数据上传',
    icon: UploadCloud,
    badge: 'AI',
    description: '上传财务报表，AI智能解析',
  },
  {
    id: 'pillar-two',
    label: 'Pillar Two HKMTT',
    shortLabel: 'Pillar Two',
    icon: Calculator,
    badge: 'AI',
    description: '全球最低税率计算',
  },
  {
    id: 'profits-tax',
    label: '利得税计算',
    shortLabel: '利得税',
    icon: FileSpreadsheet,
    badge: 'AI',
    description: '香港利得税自动化计算',
  },
  {
    id: 'return-filling',
    label: 'Return 自动填报',
    shortLabel: 'Return填报',
    icon: FileText,
    badge: 'AI',
    description: '税表自动填报与校验',
  },
  {
    id: 'cover-letter',
    label: 'Cover Letter 生成',
    shortLabel: '信函生成',
    icon: Brain,
    badge: 'AI',
    description: '专业税务信函自动生成',
  },
  {
    id: 'export',
    label: '导出与交付',
    shortLabel: '导出交付',
    icon: Download,
    badge: null,
    description: '全套交付物导出',
  },
]

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left',
                'hover:bg-muted/50',
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-muted-foreground hover:text-foreground border-l-4 border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="ai" className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </p>
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
