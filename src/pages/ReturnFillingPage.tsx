import React, { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronRight,
  ChevronDown,
  Edit3,
  Save,
  Tag,
  Wand2,
  FileSpreadsheet,
  Table2,
  FileText,
  FolderOpen,
  File,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spreadsheet, SpreadsheetCell } from '@/components/ui/Spreadsheet'
import { FortuneSheet } from '@/components/ui/FortuneSheet'
import { getProfitsTaxSheetData, profitsTaxNavTree, type NavTreeItem } from '@/data/profitsTaxTemplate'

const validationResults = [
  { type: 'success', message: '所有必填字段已完成' },
  { type: 'success', message: '数值计算校验通过' },
  { type: 'success', message: 'iXBRL 标签映射完成' },
  { type: 'warning', message: '建议复核第 10 项计算结果' },
]

const ixbrlTags = [
  { field: '应评税利润', tag: 'hk:AssessableProfits', namespace: 'hk-tax' },
  { field: '应缴税款', tag: 'hk:TaxPayable', namespace: 'hk-tax' },
  { field: '折旧免税额', tag: 'hk:DepreciationAllowance', namespace: 'hk-tax' },
]

// Return 表格数据
const returnHeaders = ['行号', '字段名称', '填报值', '数据来源', '状态', 'iXBRL标签']
const returnWidths = [50, 160, 200, 110, 80, 170]
const returnRows: SpreadsheetCell[][] = [
  [
    { value: 1, align: 'center' },
    { value: '纳税人名称', bold: true },
    { value: 'ABC Trading Limited', editable: true },
    { value: '公司注册信息', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:TaxpayerName', color: '#0369a1', italic: true },
  ],
  [
    { value: 2, align: 'center' },
    { value: '业务性质', bold: true },
    { value: '进出口贸易', editable: true },
    { value: 'AI 识别', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:NatureOfBusiness', color: '#0369a1', italic: true },
  ],
  [
    { value: 3, align: 'center' },
    { value: '评税年度', bold: true },
    { value: '2024/25', editable: true },
    { value: '系统设定', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:YearOfAssessment', color: '#0369a1', italic: true },
  ],
  [
    { value: 4, align: 'center' },
    { value: '总收入', bold: true },
    { value: 'HKD 125,000,000', editable: true },
    { value: '财务数据', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:GrossIncome', color: '#0369a1', italic: true },
  ],
  [
    { value: 5, align: 'center' },
    { value: '应评税利润', bold: true },
    { value: 'HKD 13,900,000', editable: true },
    { value: '计算引擎', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:AssessableProfits', color: '#0369a1', italic: true },
  ],
  [
    { value: 6, align: 'center' },
    { value: '优惠税率利润', bold: true },
    { value: 'HKD 2,000,000', editable: true },
    { value: '计算引擎', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:ConcessionaryProfits', color: '#0369a1', italic: true },
  ],
  [
    { value: 7, align: 'center' },
    { value: '标准税率利润', bold: true },
    { value: 'HKD 11,900,000', editable: true },
    { value: '计算引擎', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:StandardRateProfits', color: '#0369a1', italic: true },
  ],
  [
    { value: 8, align: 'center', bg: '#fef3c7' },
    { value: '应缴税款', bold: true, bg: '#fef3c7' },
    { value: 'HKD 2,138,500', color: '#16a34a', bold: true, bg: '#fef3c7', editable: true },
    { value: '计算引擎', color: '#64748b', bg: '#fef3c7' },
    { value: '自动', color: '#16a34a', align: 'center', bg: '#fef3c7' },
    { value: 'hk:TaxPayable', color: '#0369a1', italic: true, bg: '#fef3c7' },
  ],
  [
    { value: 9, align: 'center' },
    { value: '已缴暂缴税', bold: true },
    { value: 'HKD 1,800,000', editable: true },
    { value: '税务记录', color: '#64748b' },
    { value: '✓ 已填', color: '#16a34a', align: 'center' },
    { value: 'hk:ProvisionalTaxPaid', color: '#0369a1', italic: true },
  ],
  [
    { value: 10, align: 'center', bg: '#fef3c7' },
    { value: '应补/应退税款', bold: true, bg: '#fef3c7' },
    { value: 'HKD 338,500', color: '#16a34a', bold: true, bg: '#fef3c7', editable: true },
    { value: '自动计算', color: '#64748b', bg: '#fef3c7' },
    { value: '自动', color: '#16a34a', align: 'center', bg: '#fef3c7' },
    { value: 'hk:TaxBalance', color: '#0369a1', italic: true, bg: '#fef3c7' },
  ],
]

// Pillar Two 数据
const pillarHeaders = ['项目', '金额 (HKD)', '备注', '计算公式']
const pillarWidths = [200, 160, 150, 200]
const pillarRows: SpreadsheetCell[][] = [
  [{ value: 'GloBE 收入', bold: true }, { value: '125,000,000', align: 'right', color: '#0369a1' }, { value: '总收入', color: '#64748b' }, { value: '来源：财务报表', italic: true, color: '#9333ea' }],
  [{ value: 'GloBE 扣除', bold: true }, { value: '111,100,000', align: 'right', color: '#0369a1' }, { value: '可扣除支出', color: '#64748b' }, { value: '来源：财务报表', italic: true, color: '#9333ea' }],
  [{ value: 'GloBE 所得', bold: true, bg: '#eff6ff' }, { value: '13,900,000', align: 'right', color: '#0369a1', bold: true, bg: '#eff6ff' }, { value: 'GloBE Income', color: '#64748b', bg: '#eff6ff' }, { value: '=B1-B2', italic: true, color: '#9333ea', bg: '#eff6ff' }],
  [{ value: '调整后 GloBE 所得' }, { value: '13,900,000', align: 'right', color: '#0369a1' }, { value: '调整后金额', color: '#64748b' }, { value: '=B3+调整项', italic: true, color: '#9333ea' }],
  [{ value: '累计亏损' }, { value: '2,500,000', align: 'right', color: '#dc2626' }, { value: '以前年度亏损', color: '#64748b' }, { value: '来源：历史数据', italic: true, color: '#9333ea' }],
  [{ value: '经调整 GloBE 所得', bold: true, bg: '#eff6ff' }, { value: '11,400,000', align: 'right', color: '#0369a1', bold: true, bg: '#eff6ff' }, { value: '扣减亏损后', color: '#64748b', bg: '#eff6ff' }, { value: '=B4-B5', italic: true, color: '#9333ea', bg: '#eff6ff' }],
  [{ value: '实质活动豁免' }, { value: '8,550,000', align: 'right', color: '#dc2626' }, { value: '75% 豁免', color: '#64748b' }, { value: '=B6*0.75', italic: true, color: '#9333ea' }],
  [{ value: '应税收入', bold: true }, { value: '2,850,000', align: 'right', color: '#0369a1', bold: true }, { value: '计税基础', color: '#64748b' }, { value: '=B6-B7', italic: true, color: '#9333ea' }],
  [{ value: '香港企业税' }, { value: '427,500', align: 'right', color: '#0369a1' }, { value: '15% 税率', color: '#64748b' }, { value: '=B8*0.15', italic: true, color: '#9333ea' }],
  [{ value: 'ETR (有效税率)', bold: true, bg: '#f0fdf4' }, { value: '15.0%', align: 'right', color: '#16a34a', bold: true, bg: '#f0fdf4' }, { value: '达标', color: '#16a34a', bg: '#f0fdf4' }, { value: '=B9/B8', italic: true, color: '#9333ea', bg: '#f0fdf4' }],
  [{ value: 'Top-up Tax', bold: true, bg: '#f0fdf4' }, { value: '0', align: 'right', color: '#16a34a', bold: true, bg: '#f0fdf4' }, { value: '无需补税', color: '#16a34a', bg: '#f0fdf4' }, { value: '=MAX(0,15%-ETR)*B8', italic: true, color: '#9333ea', bg: '#f0fdf4' }],
]

export function ReturnFillingPage() {
  const [activeTab, setActiveTab] = useState('form')
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [fillProgress, setFillProgress] = useState(100)
  const [activeNavId, setActiveNavId] = useState('page-1')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['profits-tax', 'tax-analysis']))
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 根据 activeNavId 获取对应的数据
  const profitsTaxData = useMemo(() => {
    const sheets = getProfitsTaxSheetData()
    return sheets.map(sheet => ({
      ...sheet,
      name: activeNavId === 'page-1' ? 'Page 1' : 
            activeNavId === 'page-2' ? 'Page 2' :
            activeNavId === 'page-3' ? 'Page 3' :
            activeNavId === 'page-4' ? 'Page 4' : sheet.name,
    }))
  }, [activeNavId])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderNavTree = (items: NavTreeItem[], depth = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <button
          onClick={() => {
            if (item.children) toggleExpand(item.id)
            else setActiveNavId(item.id)
          }}
          className={cn(
            'w-full flex items-center gap-1.5 px-2 py-1.5 text-xs rounded hover:bg-muted/50 transition-colors text-left',
            activeNavId === item.id && 'bg-primary/10 text-primary font-medium',
            item.active && activeNavId !== item.id && 'font-medium',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {item.children ? (
            expandedIds.has(item.id)
              ? <ChevronDown className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
              : <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          ) : (
            <File className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{item.label}</span>
        </button>
        {item.children && expandedIds.has(item.id) && (
          <div>{renderNavTree(item.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  const handleAutoFill = () => {
    setIsAutoFilling(true)
    setFillProgress(0)
    const interval = setInterval(() => {
      setFillProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAutoFilling(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Return AI 自动填报"
        subtitle="基于计算结果自动填报税表，支持 iXBRL 标签"
      />

      <div className="p-6 space-y-6">
        {isAutoFilling && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-sm">AI 正在自动填报...</p>
                  <div className="mt-2 h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${fillProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm font-mono text-primary">{fillProgress}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="form" className="gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    Return 表格
                  </TabsTrigger>
                  <TabsTrigger value="pillarTwo" className="gap-1.5">
                    <Table2 className="w-4 h-4" />
                    Pillar Two
                  </TabsTrigger>
                  <TabsTrigger value="profitsTax" className="gap-1.5">
                    <Table2 className="w-4 h-4" />
                    利得税计算
                  </TabsTrigger>
                  <TabsTrigger value="ixbrl" className="gap-1.5">
                    <Tag className="w-4 h-4" />
                    iXBRL
                  </TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出 Excel
                </Button>
              </div>

              <TabsContent value="form" className="mt-4">
                <Spreadsheet
                  title="香港税务局报税表"
                  headers={returnHeaders}
                  rows={returnRows}
                  columnWidths={returnWidths}
                  height={460}
                  onCellChange={(r, c, v) => console.log('Cell changed:', r, c, v)}
                />
              </TabsContent>

              <TabsContent value="pillarTwo" className="mt-4">
                <Spreadsheet
                  title="Pillar Two HKMTT 计算"
                  headers={pillarHeaders}
                  rows={pillarRows}
                  columnWidths={pillarWidths}
                  height={460}
                />
              </TabsContent>

              <TabsContent value="profitsTax" className="mt-4">
                <div className={cn(
                  "flex gap-0 border border-border rounded-lg overflow-hidden",
                  isFullscreen && "fixed inset-0 z-50 bg-background rounded-none"
                )} style={{ height: isFullscreen ? '100vh' : 600 }}>
                  {/* 左侧树形导航 */}
                  <div className={cn(
                    "flex-shrink-0 border-r border-border bg-muted/20 overflow-y-auto",
                    isFullscreen ? "w-[280px]" : "w-[200px]"
                  )}>
                    <div className="p-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Profits Tax Computation</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {renderNavTree(profitsTaxNavTree)}
                    </div>
                  </div>
                  {/* 右侧 FortuneSheet 区域 */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {/* 顶部状态栏 */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Template has been updated
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs h-7">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview tax return
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? (
                            <>
                              <Minimize2 className="w-3 h-3 mr-1" />
                              还原
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3 h-3 mr-1" />
                              全屏
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {/* FortuneSheet */}
                    <div className="flex-1 relative">
                      {activeTab === 'profitsTax' && (
                        <FortuneSheet
                          key={activeNavId}
                          data={profitsTaxData}
                          height={isFullscreen ? 'calc(100vh - 48px)' : 520}
                          width="100%"
                          showToolbar={true}
                          showFormulaBar={false}
                          showSheetTabs={false}
                          allowEdit={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ixbrl" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Tag className="w-5 h-5 text-primary" />
                      iXBRL 标签映射
                    </CardTitle>
                    <CardDescription>已为关键字段添加 iXBRL 标签，符合税局电子报送要求</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ixbrlTags.map((tag, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                          <div>
                            <p className="font-medium">{tag.field}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="font-mono text-xs">{tag.namespace}</Badge>
                              <code className="text-xs bg-primary/5 px-2 py-0.5 rounded text-primary">{tag.tag}</code>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI 校验结果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validationResults.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg text-sm',
                      result.type === 'success' && 'bg-success/5',
                      result.type === 'warning' && 'bg-warning/5'
                    )}
                  >
                    {result.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {result.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                    <span className="text-muted-foreground">{result.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleAutoFill} disabled={isAutoFilling}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI 一键填报
                </Button>
                <Button variant="outline" className="w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  手动编辑
                </Button>
                <Button variant="outline" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  保存草稿
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  导出 iXBRL
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline">返回修改</Button>
          <Button>
            生成 Cover Letter
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
