import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Bell, User, ChevronDown, Cpu, Database } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
}

export function Header({ title, subtitle, rightContent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* AI 状态 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI 引擎就绪</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </div>

        {/* 数据库状态 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/5 border border-success/10">
          <Database className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">已连接</span>
        </div>

        {/* 通知 */}
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </button>

        {/* 用户 */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium">税务专员</p>
            <p className="text-xs text-muted-foreground">admin@hktax.ai</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
