import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Calculator,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  ChevronRight,
  FileSpreadsheet,
  TrendingUp,
  RefreshCw,
  Building2,
  Percent,
  DollarSign,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

// 税负结构饼图数据
const taxStructureData = [
  { name: '优惠税率 (8.25%)', value: 165000, color: '#d97706' },
  { name: '标准税率 (16.5%)', value: 1963500, color: '#f97316' },
]

// 利润瀑布图数据
const profitWaterfallData = [
  { name: '营业额', value: 125, fill: '#f97316' },
  { name: '销货成本', value: -85, fill: '#dc2626' },
  { name: '毛利', value: 40, fill: '#84cc16' },
  { name: '经营费用', value: -20, fill: '#dc2626' },
  { name: '折旧摊销', value: -3, fill: '#dc2626' },
  { name: '其他调整', value: -3.1, fill: '#dc2626' },
  { name: '应评税利润', value: 13.9, fill: '#c2410c' },
]

// 不可扣减费用构成
const nonDeductibleChartData = [
  { name: '关联方利息', value: 260000, color: '#dc2626' },
  { name: '娱乐费用', value: 180000, color: '#f97316' },
  { name: '私人支出', value: 95000, color: '#eab308' },
  { name: '罚款罚金', value: 45000, color: '#fb923c' },
]

// 折旧免税额构成
const depreciationChartData = [
  { name: '环保设施', value: 1500000, color: '#84cc16' },
  { name: '机器设备', value: 1700000, color: '#d97706' },
  { name: '工业建筑', value: 480000, color: '#f97316' },
  { name: '商业建筑', value: 200000, color: '#fbb924' },
]

const profitTaxData = {
  netProfit: 15680000,
  nonDeductible: 580000,
  taxExemptIncome: 1200000,
  assessableProfit: 13900000,
  taxRate: 0.165,
  concessionaryRate: 0.0825,
  concessionaryProfit: 2000000,
  standardProfit: 11900000,
  taxPayable: 2138500,
}

const nonDeductibleItems = [
  { id: 1, item: '娱乐费用', amount: 180000, reason: '非完全为业务目的', section: '第16条' },
  { id: 2, item: '罚款及罚金', amount: 45000, reason: '违法行为的处罚', section: '第17条' },
  { id: 3, item: '私人性质支出', amount: 95000, reason: '董事个人支出', section: '第17条' },
  { id: 4, item: '关联方利息', amount: 260000, reason: '超出独立交易原则', section: '第16(2)条' },
]

const depreciationAllowances = [
  { id: 1, category: '机器及设备', poolBalance: 8500000, allowance: 1700000, rate: '20%', type: '年度免税额' },
  { id: 2, category: '工业建筑物', poolBalance: 12000000, allowance: 480000, rate: '4%', type: '年度免税额' },
  { id: 3, category: '商业建筑物', poolBalance: 5000000, allowance: 200000, rate: '4%', type: '年度免税额' },
  { id: 4, category: '环保设施', cost: 1500000, allowance: 1500000, rate: '100%', type: '初期免税额' },
]

const aiAdjustments = [
  {
    type: 'warning',
    title: '识别到不可扣减费用',
    description: 'AI 识别出 4 项不可扣减费用，合计 HKD 580,000，已自动调整应评税利润',
  },
  {
    type: 'success',
    title: '折旧免税额已计算',
    description: '已自动计算 4 类资产的折旧免税额，总计 HKD 3,880,000',
  },
  {
    type: 'info',
    title: '优惠税率适用',
    description: '首 HKD 2,000,000 利润适用 8.25% 优惠税率，已自动分档计算',
  },
]

export function ProfitsTaxPage() {
  const { selectedEntity, selectedGroup } = useApp()
  const [activeTab, setActiveTab] = useState('computation')
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => setIsCalculating(false), 2000)
  }

  // 未选择实体时显示提示
  if (!selectedEntity) {
    return (
      <div className="min-h-screen">
        <Header
          title="利得税计算"
          subtitle="请先选择一个实体开始操作"
        />
        <div className="p-6">
          <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">请先选择实体</h3>
            <p className="text-muted-foreground text-sm mb-4">
              利得税计算需要针对具体的实体进行，请在顶部选择器中选择集团和实体
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

  return (
    <div className="min-h-screen">
      <Header
        title={`${selectedEntity.name} - 利得税计算`}
        subtitle={`${selectedGroup?.name || ''} · ${selectedEntity.jurisdiction.name}`}
      />

      <div className="p-6 space-y-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '应评税利润', value: formatCurrency(profitTaxData.assessableProfit), icon: DollarSign, color: 'text-primary' },
            { label: '适用税率', value: '8.25% / 16.5%', icon: Percent, color: 'text-info' },
            { label: '折旧免税额', value: formatCurrency(3880000), icon: TrendingUp, color: 'text-success' },
            { label: '应缴利得税', value: formatCurrency(profitTaxData.taxPayable), icon: Calculator, color: 'text-warning' },
          ].map((stat) => (
            <Card key={stat.label} hover>
              <CardContent className="pt-6">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10')}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI 调整提示 */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">AI 智能计算就绪</p>
                <div className="mt-2 space-y-1">
                  {aiAdjustments.map((adj, idx) => (
                    <div key={idx} className={cn(
                      'text-xs flex items-center gap-2',
                      adj.type === 'warning' ? 'text-warning' :
                      adj.type === 'success' ? 'text-success' : 'text-info'
                    )}>
                      {adj.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> :
                       adj.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> :
                       <Sparkles className="w-3 h-3" />}
                      <span>{adj.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-primary hover:bg-primary/90"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    计算中...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    开始计算
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 详细计算 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">利得税计算明细</CardTitle>
            <CardDescription>2024/25 年度</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="computation">计算表</TabsTrigger>
                <TabsTrigger value="non-deductible">不可扣减</TabsTrigger>
                <TabsTrigger value="depreciation">折旧免税</TabsTrigger>
                <TabsTrigger value="charts">图表分析</TabsTrigger>
              </TabsList>

              <TabsContent value="computation" className="mt-4">
                <div className="space-y-4">
                  {[
                    { label: '净利润 (账面)', value: profitTaxData.netProfit },
                    { label: '(+) 不可扣减费用', value: profitTaxData.nonDeductible },
                    { label: '(-) 豁免税收入', value: -profitTaxData.taxExemptIncome },
                    { label: '应评税利润', value: profitTaxData.assessableProfit, highlight: true },
                    { label: '优惠税率利润 @ 8.25%', value: profitTaxData.concessionaryProfit },
                    { label: '标准税率利润 @ 16.5%', value: profitTaxData.standardProfit },
                    { label: '应缴利得税', value: profitTaxData.taxPayable, highlight: true, bold: true },
                  ].map((step) => (
                    <div key={step.label} className={cn(
                      'flex items-center justify-between py-2 border-b',
                      step.highlight ? 'bg-muted/50 px-3 rounded-lg border-primary/20' : ''
                    )}>
                      <span className={cn(step.bold ? 'font-semibold' : 'text-muted-foreground')}>
                        {step.label}
                      </span>
                      <span className={cn('font-mono', step.bold ? 'text-lg font-bold text-primary' : '')}>
                        {formatCurrency(step.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="non-deductible" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>项目</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>条款</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonDeductibleItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{item.reason}</TableCell>
                        <TableCell><Badge variant="outline">{item.section}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="depreciation" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>类别</TableHead>
                      <TableHead>类别/成本</TableHead>
                      <TableHead>免税额</TableHead>
                      <TableHead>税率</TableHead>
                      <TableHead>类型</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depreciationAllowances.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(item.poolBalance || item.cost!)}</TableCell>
                        <TableCell className="font-mono text-success">{formatCurrency(item.allowance)}</TableCell>
                        <TableCell><Badge variant="secondary">{item.rate}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{item.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="charts" className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 税负结构饼图 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">税负结构</CardTitle>
                      <CardDescription>优惠税率 vs 标准税率</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={taxStructureData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={80}
                            dataKey="value"
                          >
                            {taxStructureData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 不可扣减费用构成 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">不可扣减费用</CardTitle>
                      <CardDescription>AI 识别的 4 项不可扣减支出</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={nonDeductibleChartData}
                            cx="50%" cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {nonDeductibleChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* 利润瀑布图 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">利润计算瀑布图</CardTitle>
                    <CardDescription>从营业额到应评税利润</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={profitWaterfallData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => `${value} M`} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {profitWaterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
