import React, { useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  type: 'excel' | 'pdf'
  size: string
  status: 'uploading' | 'parsing' | 'mapping' | 'validating' | 'completed' | 'error'
  progress: number
  issues?: number
  records?: number
}

const mockParsedData = [
  { id: 1, accountCode: '1001', accountName: '银行存款 - 港币', bookValue: '12,580,000.00', taxValue: '12,580,000.00', status: 'matched', confidence: 99 },
  { id: 2, accountCode: '1002', accountName: '银行存款 - 美元', bookValue: '8,240,000.00', taxValue: '8,240,000.00', status: 'matched', confidence: 99 },
  { id: 3, accountCode: '2101', accountName: '应收账款', bookValue: '5,680,000.00', taxValue: '5,420,000.00', status: 'adjusted', confidence: 85 },
  { id: 4, accountCode: '3101', accountName: '存货', bookValue: '3,200,000.00', taxValue: '3,200,000.00', status: 'matched', confidence: 92 },
  { id: 5, accountCode: '4001', accountName: '预付款项', bookValue: '450,000.00', taxValue: '400,000.00', status: 'warning', confidence: 78 },
  { id: 6, accountCode: '5101', accountName: '固定资产 - 机器设备', bookValue: '15,800,000.00', taxValue: '14,200,000.00', status: 'adjusted', confidence: 88 },
  { id: 7, accountCode: '6101', accountName: '累计折旧', bookValue: '-6,320,000.00', taxValue: '-5,680,000.00', status: 'adjusted', confidence: 91 },
  { id: 8, accountCode: '7201', accountName: '应付账款', bookValue: '-4,200,000.00', taxValue: '-4,200,000.00', status: 'matched', confidence: 95 },
  { id: 9, accountCode: '8101', accountName: '工资及薪金', bookValue: '-8,500,000.00', taxValue: '-8,500,000.00', status: 'matched', confidence: 97 },
  { id: 10, accountCode: '9101', accountName: '租金支出', bookValue: '-2,400,000.00', taxValue: '-2,400,000.00', status: 'matched', confidence: 99 },
]

const aiInsights = [
  {
    type: 'success',
    title: '科目映射完成',
    description: '已成功映射 156 个会计科目至税务口径，准确率 97.4%',
  },
  {
    type: 'warning',
    title: '发现调整项',
    description: '识别出 12 个需要税务调整的科目，建议复核',
  },
  {
    type: 'info',
    title: '数据质量良好',
    description: '数据完整性 99.2%，符合填报要求',
  },
]

export function DataUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const [showResults, setShowResults] = useState(true)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Simulate file upload
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: 'FY2024_Trial_Balance.xlsx',
      type: 'excel',
      size: '2.4 MB',
      status: 'uploading',
      progress: 0,
    }
    setFiles([newFile])

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setParseProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setShowResults(true)
      }
    }, 300)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle2 className="w-4 h-4 text-success" />
      case 'adjusted':
        return <RefreshCw className="w-4 h-4 text-warning" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <Badge variant="success">已匹配</Badge>
      case 'adjusted':
        return <Badge variant="warning">已调整</Badge>
      case 'warning':
        return <Badge variant="destructive">需复核</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="数据上传与 AI 智能解析"
        subtitle="上传财务报表，AI 自动识别、映射、清洗数据"
      />

      <div className="p-6 space-y-6">
        {/* 上传区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" />
                  上传财务文件
                </CardTitle>
                <CardDescription>
                  支持 Excel (.xlsx, .xls)、PDF 格式的试算表、财务报表
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer',
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        拖拽文件到此处，或点击上传
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        单个文件最大 50MB，支持批量上传
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Button variant="outline" size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        选择 Excel
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        选择 PDF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 上传进度 */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{file.name}</p>
                            <Badge variant="secondary">{file.size}</Badge>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                              <span>AI 正在解析...</span>
                              <span>{parseProgress}%</span>
                            </div>
                            <Progress value={parseProgress} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI 状态面板 */}
          <div className="space-y-4">
            <Card hover className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI 解析状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: '文件解析', status: 'completed', time: '2.3s' },
                    { label: '科目识别', status: 'completed', time: '1.8s' },
                    { label: '税务映射', status: 'completed', time: '3.1s' },
                    { label: '数据清洗', status: 'completed', time: '1.5s' },
                    { label: '质量校验', status: 'completed', time: '0.9s' },
                  ].map((step, index) => (
                    <div key={step.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm">{step.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{step.time}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">总耗时</span>
                    <span className="font-medium text-primary">9.6 秒</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 洞察 */}
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI 洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      insight.type === 'success' && 'bg-success/5 border border-success/20',
                      insight.type === 'warning' && 'bg-warning/5 border border-warning/20',
                      insight.type === 'info' && 'bg-info/5 border border-info/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {insight.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                      {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />}
                      {insight.type === 'info' && <Eye className="w-4 h-4 text-info mt-0.5" />}
                      <div>
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 解析结果 */}
        {showResults && (
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    AI 解析结果 - 科目映射表
                  </CardTitle>
                  <CardDescription className="mt-1">
                    已自动识别并映射 156 个会计科目，其中 12 个需要税务调整
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出映射
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新解析
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>科目代码</TableHead>
                    <TableHead>科目名称</TableHead>
                    <TableHead className="text-right">账面价值</TableHead>
                    <TableHead className="text-right">税务价值</TableHead>
                    <TableHead className="text-center">AI 置信度</TableHead>
                    <TableHead className="text-center">状态</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockParsedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">{row.accountCode}</TableCell>
                      <TableCell>{row.accountName}</TableCell>
                      <TableCell className="text-right font-mono">{row.bookValue}</TableCell>
                      <TableCell className="text-right font-mono">{row.taxValue}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                row.confidence >= 90 ? 'bg-success' : row.confidence >= 80 ? 'bg-warning' : 'bg-destructive'
                              )}
                              style={{ width: `${row.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{row.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 汇总信息 */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                {[
                  { label: '总科目数', value: '156', icon: FileSpreadsheet, color: 'text-primary' },
                  { label: '已匹配', value: '144', icon: CheckCircle2, color: 'text-success' },
                  { label: '已调整', value: '10', icon: RefreshCw, color: 'text-warning' },
                  { label: '需复核', value: '2', icon: AlertTriangle, color: 'text-destructive' },
                ].map((stat, index) => (
                  <div key={stat.label} className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <stat.icon className={cn('w-4 h-4', stat.color)} />
                      <span className="text-sm">{stat.label}</span>
                    </div>
                    <p className={cn('text-2xl font-semibold', stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 下一步 */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline">
            保存草稿
          </Button>
          <Button>
            开始 Pillar Two 计算
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
