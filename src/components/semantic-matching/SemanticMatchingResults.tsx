import { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { MatchResult, MatchCandidate } from '@/types/semantic-matching'
import { detectDescriptionConflict } from '@/lib/semanticMatching'

interface SemanticMatchingResultsProps {
  results: MatchResult[]
  onApproveMatch?: (accountId: string, matchedId: string) => void
  onRejectMatch?: (accountId: string) => void
  onRequestReview?: (accountId: string, reason: string) => void
}

export function SemanticMatchingResults({
  results,
  onApproveMatch,
  onRejectMatch,
  onRequestReview,
}: SemanticMatchingResultsProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low' | 'review'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const toggleRow = (accountId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedRows(newExpanded)
  }

  // 过滤结果
  const filteredResults = results.filter(result => {
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (
        !result.currentDescription.toLowerCase().includes(term) &&
        !result.currentAccountId.toLowerCase().includes(term)
      ) {
        return false
      }
    }

    // 置信度过滤
    const sim = result.bestMatch?.similarity || 0
    switch (filterLevel) {
      case 'high':
        return sim >= 0.9
      case 'medium':
        return sim >= 0.7 && sim < 0.9
      case 'low':
        return sim < 0.7
      case 'review':
        return result.requiresManualReview
      default:
        return true
    }
  })

  // 获取置信度样式
  const getConfidenceBadge = (similarity: number) => {
    if (similarity >= 0.9) {
      return <Badge variant="success">高置信度</Badge>
    }
    if (similarity >= 0.7) {
      return <Badge variant="warning">中等置信度</Badge>
    }
    return <Badge variant="destructive">低置信度</Badge>
  }

  // 获取冲突信息
  const getConflictInfo = (result: MatchResult) => {
    if (!result.bestMatch) return null

    const conflict = detectDescriptionConflict(
      result.currentDescription,
      result.bestMatch.previousDescription,
      result.bestMatch.similarity
    )

    return conflict
  }

  // 统计信息
  const stats = {
    total: results.length,
    high: results.filter(r => (r.bestMatch?.similarity || 0) >= 0.9).length,
    medium: results.filter(r => {
      const sim = r.bestMatch?.similarity || 0
      return sim >= 0.7 && sim < 0.9
    }).length,
    low: results.filter(r => (r.bestMatch?.similarity || 0) < 0.7).length,
    review: results.filter(r => r.requiresManualReview).length,
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '总计', value: stats.total, icon: Search, color: 'text-primary' },
          { label: '高置信度', value: stats.high, icon: CheckCircle2, color: 'text-success' },
          { label: '中等', value: stats.medium, icon: RefreshCw, color: 'text-warning' },
          { label: '低置信度', value: stats.low, icon: AlertTriangle, color: 'text-destructive' },
          { label: '待复核', value: stats.review, icon: Eye, color: 'text-info' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className={cn('text-xl font-semibold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 过滤和搜索 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索科目代码或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {[
            { value: 'all', label: '全部' },
            { value: 'high', label: '高' },
            { value: 'medium', label: '中' },
            { value: 'low', label: '低' },
            { value: 'review', label: '待复核' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterLevel(opt.value as typeof filterLevel)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filterLevel === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 结果表格 */}
      <Card hover>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            c/f 语义匹配结果
          </CardTitle>
          <CardDescription>
            显示 {filteredResults.length} / {results.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>科目代码</TableHead>
                <TableHead>当前描述</TableHead>
                <TableHead>最佳匹配</TableHead>
                <TableHead className="text-center">相似度</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.slice(0, 20).map((result) => {
                const isExpanded = expandedRows.has(result.currentAccountId)
                const conflict = getConflictInfo(result)

                return (
                  <>
                    <TableRow
                      key={result.currentAccountId}
                      className={cn(
                        result.requiresManualReview && 'bg-warning/5'
                      )}
                    >
                      <TableCell>
                        <button
                          onClick={() => toggleRow(result.currentAccountId)}
                          className="p-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {result.currentAccountId}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-xs">{result.currentDescription}</p>
                      </TableCell>
                      <TableCell>
                        {result.bestMatch ? (
                          <div>
                            <p className="text-sm truncate max-w-xs">{result.bestMatch.previousDescription}</p>
                            <p className="text-xs text-muted-foreground">{result.bestMatch.previousYear}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">无匹配</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.bestMatch ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  result.bestMatch.similarity >= 0.9 ? 'bg-success' :
                                  result.bestMatch.similarity >= 0.7 ? 'bg-warning' : 'bg-destructive'
                                )}
                                style={{ width: `${result.bestMatch.similarity * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">
                              {(result.bestMatch.similarity * 100).toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.bestMatch ? (
                          <div className="flex flex-col items-center gap-1">
                            {getConfidenceBadge(result.bestMatch.similarity)}
                            {conflict?.hasConflict && (
                              <Badge variant="outline" className="text-xs">
                                {conflict.conflictType}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="info">新业务</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {result.bestMatch && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onApproveMatch?.(result.currentAccountId, result.bestMatch!.previousAccountId)}
                              >
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRejectMatch?.(result.currentAccountId)}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {result.requiresManualReview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRequestReview?.(result.currentAccountId, result.reviewReason || '')}
                            >
                              <Eye className="w-4 h-4 text-info" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* 展开详情 */}
                    {isExpanded && result.bestMatch && (
                      <TableRow key={`${result.currentAccountId}-detail`} className="bg-muted/30">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">当前描述</p>
                                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                                    {result.currentDescription}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">去年描述</p>
                                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                                    {result.bestMatch.previousDescription}
                                  </p>
                                </div>
                              </div>

                              {/* 匹配字段 */}
                              {result.bestMatch.matchedFields.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">匹配关键词</p>
                                  <div className="flex flex-wrap gap-2">
                                    {result.bestMatch.matchedFields.map((field, i) => (
                                      <Badge key={i} variant="secondary">{field}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 其他候选 */}
                              {result.allCandidates.length > 1 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">其他候选 ({result.allCandidates.length - 1})</p>
                                  <div className="space-y-2">
                                    {result.allCandidates.slice(1).map((candidate) => (
                                      <div key={candidate.previousAccountId} className="flex items-center justify-between p-2 rounded bg-background">
                                        <span className="text-sm truncate max-w-md">{candidate.previousDescription}</span>
                                        <span className="text-sm font-mono text-muted-foreground">
                                          {(candidate.similarity * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 冲突信息 */}
                              {conflict?.hasConflict && (
                                <div className={cn(
                                  'p-3 rounded-lg',
                                  conflict.severity === 'high' ? 'bg-destructive/10 border border-destructive/20' :
                                  conflict.severity === 'medium' ? 'bg-warning/10 border border-warning/20' :
                                  'bg-info/10 border border-info/20'
                                )}>
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className={cn(
                                      'w-4 h-4 mt-0.5',
                                      conflict.severity === 'high' ? 'text-destructive' :
                                      conflict.severity === 'medium' ? 'text-warning' : 'text-info'
                                    )} />
                                    <div>
                                      <p className="text-sm font-medium">{conflict.conflictType}</p>
                                      <p className="text-sm text-muted-foreground">{conflict.suggestion}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>

          {filteredResults.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              显示前 20 条，共 {filteredResults.length} 条记录
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
