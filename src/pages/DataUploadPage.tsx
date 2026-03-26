import React, { useState, useCallback, useRef } from 'react'
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
  Calendar,
  AlertCircle,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  parseExcelFile,
  parseCsvFile,
  detectFileType,
  formatFileSize,
  generateId,
} from '@/lib/fileParser'
import {
  logFileUpload,
  logAudit,
  getAuditLogsByFileId,
} from '@/lib/auditLog'
import type {
  ParsedFile,
  ParsedRow,
  ValidationIssue,
  YearInfo,
} from '@/types/file-upload'

export function DataUploadPage() {
  const [files, setFiles] = useState<ParsedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [parsingFile, setParsingFile] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [yearInfo, setYearInfo] = useState<YearInfo | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // 文件处理
  const processFile = async (file: File) => {
    const fileId = generateId()
    const fileType = detectFileType(file)

    if (fileType === 'unknown') {
      alert('不支持的文件格式，请上传 Excel (.xlsx, .xls) 或 CSV 文件')
      return
    }

    if (fileType === 'pdf') {
      alert('PDF 解析功能开发中，请使用 Excel 或 CSV 格式')
      return
    }

    // 记录文件上传
    logFileUpload(file.name, fileId, formatFileSize(file.size), fileType)

    const newFile: ParsedFile = {
      id: fileId,
      name: file.name,
      type: fileType,
      size: formatFileSize(file.size),
      status: 'uploading',
      progress: 0,
      createdAt: new Date(),
    }

    setFiles(prev => [...prev, newFile])
    setParsingFile(true)
    setShowResults(false)

    try {
      // 模拟上传进度
      let uploadProgress = 0
      const uploadInterval = setInterval(() => {
        uploadProgress += 20
        setParseProgress(uploadProgress)
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, progress: Math.min(uploadProgress, 90) } : f
          )
        )
        if (uploadProgress >= 90) {
          clearInterval(uploadInterval)
        }
      }, 100)

      // 解析文件
      const result = fileType === 'csv'
        ? await parseCsvFile(file)
        : await parseExcelFile(file)

      // 更新文件状态
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                records: result.data.length,
                issues: result.issues.filter(i => i.type === 'warning' || i.type === 'error').length,
              }
            : f
        )
      )

      // 设置解析结果
      setParsedRows(result.data)
      setYearInfo(result.yearInfo || null)
      setValidationIssues(result.issues)
      setSelectedFileId(fileId)

      // 记录解析完成
      logAudit('FILE_PARSE', {
        fileId,
        fileName: file.name,
        recordCount: result.data.length,
        issueCount: result.issues.length,
        yearDetected: result.yearInfo?.sourceYear,
        yearTarget: result.yearInfo?.targetYear,
      })

      clearInterval(uploadInterval)
      setParseProgress(100)
      setShowResults(true)

    } catch (error) {
      console.error('文件解析错误:', error)
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error' }
            : f
        )
      )
      alert(`文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setParsingFile(false)
    }
  }

  // 拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      processFile(droppedFiles[0])
    }
  }, [])

  // 点击上传
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      processFile(selectedFiles[0])
    }
  }

  // 获取操作历史
  const auditLogs = selectedFileId ? getAuditLogsByFileId(selectedFileId) : []

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
      case 'new-account':
        return <Badge variant="info">新业务</Badge>
      default:
        return null
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />
      default:
        return <AlertCircle className="w-4 h-4 text-info" />
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="数据上传与解析"
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
                  支持 Excel (.xlsx, .xls)、CSV 格式的试算表、财务报表
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 拖拽区域 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer',
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
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
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        选择 Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                        <FileText className="w-4 h-4 mr-2" />
                        选择 CSV
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
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border',
                          file.status === 'error' ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50 border-border'
                        )}
                      >
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{file.size}</Badge>
                              {file.status === 'completed' && (
                                <Badge variant="success">{file.records} 条记录</Badge>
                              )}
                            </div>
                          </div>
                          {file.status !== 'completed' && file.status !== 'error' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                                <span>
                                  {file.status === 'uploading' && '上传中...'}
                                  {file.status === 'parsing' && 'AI 正在解析...'}
                                </span>
                                <span>{file.progress}%</span>
                              </div>
                              <Progress value={file.progress} />
                            </div>
                          )}
                          {file.status === 'error' && (
                            <p className="text-sm text-destructive mt-1">解析失败，请检查文件格式</p>
                          )}
                        </div>
                        {file.status === 'completed' && (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        )}
                        {file.status === 'error' && (
                          <XCircle className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-4">
            {/* AI 状态面板 */}
            <Card hover className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI 解析状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {parsingFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>正在解析...</span>
                    </div>
                  ) : (
                    [
                      { label: '文件解析', status: parseProgress >= 30 ? 'completed' : 'pending', time: '2.3s' },
                      { label: '科目识别', status: parseProgress >= 50 ? 'completed' : 'pending', time: '1.8s' },
                      { label: '年份替换', status: parseProgress >= 70 ? 'completed' : 'pending', time: '0.5s' },
                      { label: '数据清洗', status: parseProgress >= 90 ? 'completed' : 'pending', time: '1.5s' },
                      { label: '质量校验', status: parseProgress >= 100 ? 'completed' : 'pending', time: '0.9s' },
                    ].map((step) => (
                      <div key={step.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className="text-sm">{step.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{step.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 年份信息 */}
            {yearInfo && (
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5 text-primary" />
                    年份检测
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">源年份</p>
                      <p className="font-medium">{yearInfo.sourceYear}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">目标年份</p>
                      <p className="font-medium text-primary">{yearInfo.targetYear}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={yearInfo.confidence >= 0.9 ? 'success' : 'warning'}>
                      置信度 {(yearInfo.confidence * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {yearInfo.fiscalYearType === 'HK' ? '香港财政年度' : '其他'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作历史 */}
            {auditLogs.length > 0 && (
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-5 h-5 text-muted-foreground" />
                    操作留痕
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {auditLogs.slice(-5).reverse().map((log) => (
                      <div key={log.id} className="text-xs p-2 rounded bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                        {log.details.reason && (
                          <p className="text-muted-foreground mt-1">{log.details.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 校验问题提示 */}
        {validationIssues.length > 0 && (
          <Card hover className="border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-warning" />
                需要关注 ({validationIssues.length} 项)
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                  {validationIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg',
                        issue.type === 'error' && 'bg-destructive/5',
                        issue.type === 'warning' && 'bg-warning/5',
                        issue.type === 'info' && 'bg-info/5'
                      )}
                    >
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {issue.suggestion}
                          </p>
                        )}
                      </div>
                      {issue.requiresManualReview && (
                        <Badge variant="warning">需人工</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
          </Card>
        )}

        {/* 解析结果 */}
        {showResults && parsedRows.length > 0 && (
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    AI 解析结果 - 科目映射表
                  </CardTitle>
                  <CardDescription className="mt-1">
                    已自动识别并映射 {parsedRows.length} 个会计科目
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
                  {parsedRows.slice(0, 20).map((row) => (
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

              {parsedRows.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  显示前 20 条，共 {parsedRows.length} 条记录
                </p>
              )}

              {/* 汇总信息 */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                {[
                  { label: '总科目数', value: parsedRows.length, icon: FileSpreadsheet, color: 'text-primary' },
                  { label: '已匹配', value: parsedRows.filter(r => r.status === 'matched').length, icon: CheckCircle2, color: 'text-success' },
                  { label: '已调整', value: parsedRows.filter(r => r.status === 'adjusted').length, icon: RefreshCw, color: 'text-warning' },
                  { label: '需复核', value: parsedRows.filter(r => r.status === 'warning' || r.status === 'new-account').length, icon: AlertTriangle, color: 'text-destructive' },
                ].map((stat) => (
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
          <Button disabled={!showResults}>
            开始 Pillar Two 计算
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
