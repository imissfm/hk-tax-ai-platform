import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Calculator,
  FileSpreadsheet,
  FileText,
  Upload,
  Brain,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Project, WorkflowStatus, ModuleStatus } from '@/types/dashboard'

interface ProjectProgressCardProps {
  project: Project
  onNavigate?: (pageId: string) => void
}

const statusConfig = {
  'on-track': { label: '正常', variant: 'success' as const },
  'at-risk': { label: '需关注', variant: 'warning' as const },
  'delayed': { label: '延期', variant: 'destructive' as const },
  'completed': { label: '已完成', variant: 'info' as const },
}

const workflowConfig = {
  pillarTwo: { label: 'Pillar Two HKMTT', icon: Calculator },
  profitsTax: { label: '利得税计算', icon: FileSpreadsheet },
  returnFilling: { label: 'Return 填报', icon: FileText },
}

const workflowStatusIcon = {
  'completed': { icon: CheckCircle2, color: 'text-success' },
  'in-progress': { icon: Circle, color: 'text-primary' },
  'review': { icon: AlertTriangle, color: 'text-warning' },
  'pending': { icon: Circle, color: 'text-muted-foreground' },
}

const moduleStatusIcon = {
  'completed': { icon: CheckCircle2, color: 'text-success' },
  'error': { icon: AlertTriangle, color: 'text-destructive' },
  'pending': { icon: Circle, color: 'text-muted-foreground' },
}

function WorkflowProgress({ label, workflow, icon: Icon }: { label: string; workflow: WorkflowStatus; icon: typeof Calculator }) {
  const statusInfo = workflowStatusIcon[workflow.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="flex items-center gap-3 py-2">
      <StatusIcon className={cn('w-4 h-4', statusInfo.color)} />
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <div className="w-24">
        <Progress value={workflow.progress} className="h-2" />
      </div>
      <span className="text-sm font-mono w-12 text-right">{workflow.progress}%</span>
      {workflow.hasIssues && (
        <AlertTriangle className="w-4 h-4 text-warning" />
      )}
    </div>
  )
}

function ModuleBadge({ label, status }: { label: string; status: ModuleStatus }) {
  const statusInfo = moduleStatusIcon[status.status]
  const StatusIcon = statusInfo.icon

  return (
    <Badge variant="outline" className={cn('gap-1', statusInfo.color)}>
      <StatusIcon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

export function ProjectProgressCard({ project, onNavigate }: ProjectProgressCardProps) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[project.status]

  return (
    <Card hover className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="text-sm text-muted-foreground">{project.fiscalYear}</span>
            </div>
            <CardTitle className="text-base">{project.clientName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{project.projectName}</p>
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>截止: {new Date(project.deadline).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 总体进度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">总体进度</span>
            <span className="text-sm font-mono font-bold text-primary">{project.overallProgress}%</span>
          </div>
          <Progress value={project.overallProgress} className="h-2" />
        </div>

        {/* 展开/折叠按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {expanded ? '收起详情' : '查看详情'}
        </button>

        {/* 展开内容 */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* 税务工作流 */}
            <div>
              <h4 className="text-sm font-medium mb-2">税务工作流</h4>
              <div className="space-y-1">
                <WorkflowProgress label={workflowConfig.pillarTwo.label} workflow={project.workflows.pillarTwo} icon={Calculator} />
                <WorkflowProgress label={workflowConfig.profitsTax.label} workflow={project.workflows.profitsTax} icon={FileSpreadsheet} />
                <WorkflowProgress label={workflowConfig.returnFilling.label} workflow={project.workflows.returnFilling} icon={FileText} />
              </div>
            </div>

            {/* 功能模块 */}
            <div>
              <h4 className="text-sm font-medium mb-2">功能模块</h4>
              <div className="flex flex-wrap gap-2">
                <ModuleBadge label="数据上传" status={project.modules.dataUpload} />
                <ModuleBadge label="AI 解析" status={project.modules.aiParsing} />
                <ModuleBadge label="导出交付" status={project.modules.exportDelivery} />
              </div>
            </div>

            {/* 操作按钮 */}
            <button
              onClick={() => onNavigate?.('profits-tax')}
              className="w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              进入项目 →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
