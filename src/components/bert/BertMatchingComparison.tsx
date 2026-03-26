import { useState, useEffect } from 'react'
import {
  Brain,
  Zap,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  createBertService,
  getBertServiceStatus,
} from '@/lib/bertService'
import type {
  BertMatchResult,
  BertMatchConfig,
  BertServiceStatus,
  MatchSuggestion,
  ComparisonDetail,
} from '@/types/bert'

interface BertMatchingComparisonProps {
  sourceTexts?: { id: string; text: string }[]
  targetTexts?: { id: string; text: string }[]
  onMatchSelect?: (sourceId: string, targetId: string) => void
}

// 默认示例数据
const DEFAULT_SOURCE_TEXTS = [
  { id: 's1', text: '银行存款 - 港币账户 2024/25' },
  { id: 's2', text: '应收账款 - 关联方交易' },
  { id: 's3', text: '固定资产折旧 - 机器设备' },
  { id: 's4', text: '工资薪金支出' },
  { id: 's5', text: '租金支出 - 办公场所' },
]

const DEFAULT_TARGET_TEXTS = [
  { id: 't1', text: '银行存款 - 港币账户 2023/24' },
  { id: 't2', text: '应收账款 - 第三方客户' },
  { id: 't3', text: '累计折旧 - 机器设备' },
  { id: 't4', text: '员工薪酬福利' },
  { id: 't5', text: '办公租金费用' },
  { id: 't6', text: '预付款项' },
]

export function BertMatchingComparison({
  sourceTexts = DEFAULT_SOURCE_TEXTS,
  targetTexts = DEFAULT_TARGET_TEXTS,
  onMatchSelect,
}: BertMatchingComparisonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [expandedSource, setExpandedSource] = useState<string | null>(null)
  const [selectedComparison, setSelectedComparison] = useState<ComparisonDetail | null>(null)
  const [serviceStatus, setServiceStatus] = useState<BertServiceStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'results' | 'comparison' | 'details'>('results')

  // 获取服务状态
  useEffect(() => {
    setServiceStatus(getBertServiceStatus())
  }, [])

  // 运行 BERT 匹配
  const runBertMatching = async () => {
    setIsProcessing(true)
    setProgress(0)
    setSuggestions([])

    try {
      const bertService = createBertService({
        model: 'bert-base-chinese',
        cacheEnabled: true,
      })

      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 100)

      // 执行匹配
      const results = await bertService.batchMatch(sourceTexts, targetTexts, {
        similarityThreshold: {
          high: 0.85,
          medium: 0.70,
          low: 0.50,
        },
        weights: {
          semantic: 0.7,
          lexical: 0.3,
        },
      })

      clearInterval(progressInterval)
      setProgress(100)
      setSuggestions(results)

      // 更新服务状态
      setServiceStatus(getBertServiceStatus())
    } catch (error) {
      console.error('BERT 匹配失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 查看详细比较
  const viewDetailedComparison = async (sourceText: string, targetText: string) => {
    const bertService = createBertService()
    const comparison = await bertService.compareDetailed(sourceText, targetText)
    setSelectedComparison(comparison)
    setActiveTab('details')
  }

  // 获取置信度颜色
  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'text-success'
      case 'medium': return 'text-warning'
      case 'low': return 'text-destructive'
    }
  }

  // 获取置信度徽章
  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return <Badge variant="success">高置信度</Badge>
      case 'medium': return <Badge variant="warning">中等置信度</Badge>
      case 'low': return <Badge variant="destructive">低置信度</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 服务状态 */}
      <Card hover>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                BERT 语义匹配引擎
              </CardTitle>
              <CardDescription>
                使用 BERT 模型进行深度语义相似度分析
              </CardDescription>
            </div>
            {serviceStatus && (
              <div className="flex items-center gap-3">
                <Badge variant={serviceStatus.isReady ? 'success' : 'destructive'}>
                  {serviceStatus.isReady ? '就绪' : '离线'}
                </Badge>
                <Badge variant="outline">{serviceStatus.model}</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {serviceStatus && [
              { label: '模型', value: serviceStatus.model.split('-').pop(), icon: Layers },
              { label: '请求次数', value: serviceStatus.requestCount, icon: Activity },
              { label: '缓存大小', value: serviceStatus.cacheSize, icon: Zap },
              { label: '平均延迟', value: `${serviceStatus.averageLatency.toFixed(0)}ms`, icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={runBertMatching}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? '处理中...' : '运行 BERT 匹配'}
            </Button>

            {isProcessing && (
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">处理进度</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 标签页导航 */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {[
            { id: 'results', label: '匹配结果', icon: CheckCircle2 },
            { id: 'comparison', label: '对比分析', icon: BarChart3 },
            { id: 'details', label: '向量详情', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-muted'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 匹配结果 */}
      {activeTab === 'results' && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.sourceId} hover>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedSource(
                  expandedSource === suggestion.sourceId ? null : suggestion.sourceId
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedSource === suggestion.sourceId ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{suggestion.sourceText}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        找到 {suggestion.suggestions.length} 个匹配
                      </p>
                    </div>
                  </div>
                  {suggestion.suggestions[0] && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">最高匹配:</span>
                      <Badge variant="success">
                        {(suggestion.suggestions[0].score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              {expandedSource === suggestion.sourceId && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {suggestion.suggestions.map((match, index) => (
                      <div
                        key={match.targetId}
                        className={cn(
                          'p-4 rounded-lg border transition-all cursor-pointer',
                          index === 0
                            ? 'border-success/50 bg-success/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => {
                          onMatchSelect?.(suggestion.sourceId, match.targetId)
                          viewDetailedComparison(suggestion.sourceText, match.targetText)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getConfidenceBadge(match.confidence)}
                              {index === 0 && <Badge variant="outline">最佳匹配</Badge>}
                            </div>
                            <p className="font-medium">{match.targetText}</p>
                            <p className="text-sm text-muted-foreground mt-1">{match.reason}</p>

                            {match.matchedPhrases.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {match.matchedPhrases.map((phrase, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {phrase}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">
                              {(match.score * 100).toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">综合相似度</p>
                          </div>
                        </div>

                        {/* 相似度条 */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>匹配强度</span>
                            <span>{(match.score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                match.confidence === 'high' ? 'bg-success' :
                                match.confidence === 'medium' ? 'bg-warning' : 'bg-destructive'
                              )}
                              style={{ width: `${match.score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 向量详情 */}
      {activeTab === 'details' && selectedComparison && (
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              向量空间分析
            </CardTitle>
            <CardDescription>
              BERT 嵌入向量的详细比较
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: '余弦相似度', value: (selectedComparison.cosineSimilarity * 100).toFixed(2) + '%', color: 'text-primary' },
                { label: '欧氏距离', value: selectedComparison.euclideanDistance.toFixed(4), color: 'text-info' },
                { label: '曼哈顿距离', value: selectedComparison.manhattanDistance.toFixed(4), color: 'text-warning' },
                { label: '点积', value: selectedComparison.dotProduct.toFixed(4), color: 'text-success' },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                  <p className={cn('text-xl font-semibold', metric.color)}>{metric.value}</p>
                </div>
              ))}
            </div>

            {/* 语义对齐图 */}
            <div>
              <p className="text-sm font-medium mb-2">语义对齐分布</p>
              <div className="h-24 flex items-end gap-px bg-muted/30 rounded-lg p-2">
                {selectedComparison.semanticAlignment.slice(0, 64).map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-primary/60 rounded-t"
                    style={{ height: `${value * 100}%` }}
                    title={`维度 ${index + 1}: ${(value * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                显示前 64 维度的语义对齐程度
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 对比分析 */}
      {activeTab === 'comparison' && suggestions.length > 0 && (
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              匹配统计对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 高/中/低置信度分布 */}
              <div>
                <p className="text-sm font-medium mb-3">置信度分布</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: '高置信度',
                      count: suggestions.filter(s => s.suggestions[0]?.confidence === 'high').length,
                      total: suggestions.length,
                      color: 'bg-success',
                    },
                    {
                      label: '中等置信度',
                      count: suggestions.filter(s => s.suggestions[0]?.confidence === 'medium').length,
                      total: suggestions.length,
                      color: 'bg-warning',
                    },
                    {
                      label: '低置信度',
                      count: suggestions.filter(s => s.suggestions[0]?.confidence === 'low').length,
                      total: suggestions.length,
                      color: 'bg-destructive',
                    },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-lg font-semibold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full', item.color)}
                          style={{ width: `${(item.count / item.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((item.count / item.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 平均相似度 */}
              <div>
                <p className="text-sm font-medium mb-3">平均相似度分析</p>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span>所有源文本的平均最佳匹配</span>
                    <span className="text-2xl font-bold text-primary">
                      {(
                        (suggestions.reduce((sum, s) => sum + (s.suggestions[0]?.score || 0), 0) /
                          suggestions.length) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* 需要人工复核的项目 */}
              {suggestions.filter(s => s.suggestions[0]?.confidence === 'low').length > 0 && (
                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium">需要人工复核</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        有 {suggestions.filter(s => s.suggestions[0]?.confidence === 'low').length} 个项目的匹配置信度较低，建议人工确认
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
