import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Archive,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  History,
  ChevronRight,
  FolderOpen,
  HardDrive,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const deliverables = [
  {
    id: 1,
    name: '利得税报税表 (IRD51)',
    type: 'pdf',
    size: '245 KB',
    status: 'ready',
    icon: FileText,
    description: '包含完整填报数据及签章区域',
  },
  {
    id: 2,
    name: '利得税报税表 (iXBRL)',
    type: 'ixbrl',
    size: '128 KB',
    status: 'ready',
    icon: FileCode,
    description: '符合税局电子报送标准',
  },
  {
    id: 3,
    name: 'Pillar Two 计算书',
    type: 'pdf',
    size: '512 KB',
    status: 'ready',
    icon: FileText,
    description: 'GloBE 收入、ETR 及 Top-up Tax 计算',
  },
  {
    id: 4,
    name: '利得税计算表',
    type: 'excel',
    size: '89 KB',
    status: 'ready',
    icon: FileSpreadsheet,
    description: '完整计算过程及调整明细',
  },
  {
    id: 5,
    name: '客户信函',
    type: 'pdf',
    size: '156 KB',
    status: 'ready',
    icon: FileText,
    description: '专业税务意见及风险提示',
  },
  {
    id: 6,
    name: '全套交付包',
    type: 'archive',
    size: '1.2 MB',
    status: 'ready',
    icon: Archive,
    description: '包含所有文件的压缩包',
  },
]

const auditLogs = [
  { time: '2024-03-26 10:30:45', action: '数据上传', user: '税务专员', detail: '上传 FY2024_Trial_Balance.xlsx' },
  { time: '2024-03-26 10:31:12', action: 'AI 解析', user: 'AI 系统', detail: '完成科目映射，识别 156 个科目' },
  { time: '2024-03-26 10:32:08', action: 'Pillar Two 计算', user: 'AI 系统', detail: 'ETR 15.01%，无 Top-up Tax' },
  { time: '2024-03-26 10:33:25', action: '利得税计算', user: 'AI 系统', detail: '应缴税额 HKD 2,138,500' },
  { time: '2024-03-26 10:34:18', action: 'Return 填报', user: 'AI 系统', detail: '完成 IRD51 表格填报' },
  { time: '2024-03-26 10:35:42', action: '信函生成', user: 'AI 系统', detail: '生成客户税务意见信函' },
  { time: '2024-03-26 10:36:00', action: '文件导出', user: '税务专员', detail: '导出全套交付文件' },
]

const stats = [
  { label: '已生成文件', value: '6', icon: FolderOpen, color: 'text-primary' },
  { label: '总大小', value: '2.3 MB', icon: HardDrive, color: 'text-info' },
  { label: '审计记录', value: '7', icon: History, color: 'text-warning' },
  { label: '数据安全', value: '已加密', icon: Shield, color: 'text-success' },
]

export function ExportPage() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleSelectAll = () => {
    if (selectedFiles.length === deliverables.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(deliverables.map(d => d.id))
    }
  }

  const handleExport = () => {
    setIsExporting(true)
    setExportProgress(0)
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const toggleFile = (id: number) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title="导出与交付中心"
        subtitle="管理并导出全套税务交付文件"
      />

      <div className="p-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} hover>
              <CardContent className="pt-6">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10')}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：交付文件 */}
          <div className="lg:col-span-2 space-y-4">
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>交付文件清单</CardTitle>
                    <CardDescription className="mt-1">
                      已生成 {deliverables.length} 个文件，可选择导出
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedFiles.length === deliverables.length ? '取消全选' : '全选'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 导出进度 */}
                {isExporting && (
                  <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">正在导出...</span>
                      <span className="text-sm text-primary">{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                  </div>
                )}

                <div className="space-y-3">
                  {deliverables.map((file) => {
                    const Icon = file.icon
                    const isSelected = selectedFiles.includes(file.id)

                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleFile(file.id)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                          isSelected
                            ? 'bg-primary/5 border-primary/30'
                            : 'bg-muted/30 border-border hover:bg-muted/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            isSelected ? 'bg-primary border-primary' : 'border-border'
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          file.type === 'pdf' && 'bg-destructive/10',
                          file.type === 'excel' && 'bg-success/10',
                          file.type === 'ixbrl' && 'bg-info/10',
                          file.type === 'archive' && 'bg-warning/10'
                        )}>
                          <Icon className={cn(
                            'w-5 h-5',
                            file.type === 'pdf' && 'text-destructive',
                            file.type === 'excel' && 'text-success',
                            file.type === 'ixbrl' && 'text-info',
                            file.type === 'archive' && 'text-warning'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{file.name}</p>
                            <Badge variant="secondary" className="text-[10px]">{file.size}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{file.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            就绪
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 批量操作 */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedFiles.length} 个文件
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={selectedFiles.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      批量下载
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      导出全部
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：审计日志 */}
          <div className="space-y-4">
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="w-5 h-5 text-primary" />
                  审计日志
                </CardTitle>
                <CardDescription>
                  记录所有操作以确保合规
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {auditLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-[10px]">{log.user}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 安全提示 */}
            <Card hover className="border-success/30 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-success">
                  <Shield className="w-5 h-5" />
                  数据安全
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 所有文件采用 AES-256 加密</p>
                  <p>• 传输使用 TLS 1.3 协议</p>
                  <p>• 符合 GDPR 数据保护要求</p>
                  <p>• 审计日志保留 7 年</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 完成提示 */}
        <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-lg">税务处理流程完成</p>
                  <p className="text-sm text-muted-foreground">
                    所有文件已生成并通过校验，可以下载并提交至香港税务局
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新处理
                </Button>
                <Button>
                  开始新案例
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
