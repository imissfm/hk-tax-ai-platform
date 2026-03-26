import { useState, useCallback, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Building2,
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
  const { selectedEntity, selectedGroup } = useApp()

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

  // 未选择实体时显示提示
  if (!selectedEntity) {
    return (
      <div className="min-h-screen">
        <Header
          title="数据上传与解析"
          subtitle="请先选择一个实体开始操作"
        />
        <div className="p-6">
          <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">请先选择实体</h3>
            <p className="text-muted-foreground text-sm mb-4">
              数据上传需要针对具体的实体进行，请在顶部选择器中选择集团和实体
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>点击顶部「当前客户」选择器开始</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 拖拽处理
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
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      processFile(droppedFiles[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFile(selectedFiles[0])
    }
  }, [])

  // 文件处理
  const processFile = async (file: File) => {
    const fileId = generateId()
    const fileType = detectFileType(file)

    if (fileType === 'unknown') {
      alert('不支持的文件格式，请上传 Excel (.xlsx, .xls) 或 CSV 文件')
      return
    }

    const newFile: ParsedFile = {
      id: fileId,
      name: file.name,
      type: fileType,
      size: formatFileSize(file.size),
      status: 'parsing',
      progress: 0,
      createdAt: new Date(),
    }

    setFiles(prev => [...prev, newFile])
    setParsingFile(true)
    setShowResults(false)
    setSelectedFileId(fileId)

    // 模拟解析过程
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setParseProgress(progress)
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 90) } : f
      ))
      if (progress >= 90) {
        clearInterval(interval)
      }
    }, 200)

    // 模拟解析完成
    setTimeout(() => {
      clearInterval(interval)
      setParsingFile(false)
      setParseProgress(100)

      // 模拟解析结果
      const mockRows: ParsedRow[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        accountCode: `ACC${String(i + 1).padStart(4, '0')}`,
        accountName: `科目 ${i + 1}`,
        bookValue: String(Math.floor(Math.random() * 1000000) + 100000),
        taxValue: String(Math.floor(Math.random() * 1000000) + 100000),
        status: 'matched' as const,
        confidence: 0.9,
        source: 'current' as const,
      }))

      setParsedRows(mockRows)
      setYearInfo({
        sourceYear: '2023/24',
        targetYear: '2024/25',
        fiscalYearType: 'HK',
        replacementType: 'auto',
        confidence: 0.95,
        detected: true,
      })
      setShowResults(true)
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
      ))

      logAudit('FILE_PARSE', {
        fileId,
        action: 'file_parsed',
        fileName: file.name,
        rowCount: mockRows.length,
        fileType,
      })
    }, 2500)
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFileId === fileId) {
      setSelectedFileId(null)
      setShowResults(false)
      setParsedRows([])
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={`${selectedEntity.name} - 数据上传`}
        subtitle={`${selectedGroup?.name || ''} · ${selectedEntity.jurisdiction.name}`}
      />

      <div className="p-6 space-y-6">
        {/* AI 智能提示 */}
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">AI 智能解析就绪</p>
                <p className="text-xs text-muted-foreground">
                  支持自动识别文件格式、提取科目数据、关联历史记录
                </p>
              </div>
              <Badge variant="ai" className="ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 就绪
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 上传区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">上传文件</CardTitle>
            <CardDescription>支持 Excel (.xlsx, .xls) 和 CSV 格式</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 transition-all text-center cursor-pointer',
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                拖拽文件到此处，或点击选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持 Excel (.xlsx, .xls) 和 CSV 格式
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 文件列表 */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">已上传文件 ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border',
                      file.status === 'completed' ? 'bg-success/5 border-success/20' :
                      file.status === 'parsing' ? 'bg-warning/5 border-warning/20' :
                      'bg-card border-border'
                    )}
                  >
                    {file.type === 'excel' ? (
                      <FileSpreadsheet className="w-5 h-5 text-success" />
                    ) : (
                      <FileText className="w-5 h-5 text-info" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                      {file.status === 'parsing' && (
                        <Progress value={file.progress} className="h-1 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <Badge variant="success">已完成</Badge>
                        </>
                      )}
                      {file.status === 'parsing' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <Badge variant="warning">解析中</Badge>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 解析结果 */}
        {showResults && parsedRows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                解析结果
              </CardTitle>
              <CardDescription>
                已识别 {parsedRows.length} 条科目记录
                {yearInfo && ` · ${yearInfo.previousYear} vs ${yearInfo.currentYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted text-sm font-medium">
                  <div>科目代码</div>
                  <div>科目名称</div>
                  <div className="text-right">本年金额</div>
                  <div className="text-right">上年金额</div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {parsedRows.slice(0, 10).map((row) => (
                    <div key={row.id} className="grid grid-cols-4 gap-4 p-3 border-t text-sm">
                      <div className="font-mono">{row.accountCode}</div>
                      <div>{row.accountName}</div>
                      <div className="text-right font-mono">{row.currentYear?.toLocaleString()}</div>
                      <div className="text-right font-mono text-muted-foreground">{row.previousYear?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  显示前 10 条，共 {parsedRows.length} 条
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  查看全部
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
