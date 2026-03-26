import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Calculator,
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  ChevronRight,
  Info,
  DollarSign,
  Percent,
  Building2,
  Globe,
  BarChart3,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'

// 管辖区对比图表数据
const jurisdictionChartData = [
  { name: '香港', income: 12.5, tax: 1.06, etr: 8.5 },
  { name: '新加坡', income: 5.88, tax: 0.88, etr: 15.0 },
  { name: '日本', income: 0, tax: 0.44, etr: 20.0 },
]

// ETR 仪表盘数据
const etrGaugeData = [
  { name: 'ETR', value: 15.01, fill: '#d97706' },
]

// GloBE 收入构成饼图 - 暖色调系
const incomeCompositionData = [
  { name: '香港', value: 12500000, color: '#f97316' },
  { name: '新加坡', value: 5880000, color: '#eab308' },
  { name: '日本', value: 0, color: '#f43f5e' },
]

// 暖色调配色方案
const CHART_COLORS = ['#c2410c', '#d97706', '#f97316', '#eab308', '#f43f5e', '#fb923c']

const adjustmentItems = [
  { id: 1, item: '净利息支出', bookAmount: 2500000, taxAmount: 2100000, adjustment: -400000, reason: '资本化利息调整', category: '财务费用' },
  { id: 2, item: '股息收入', bookAmount: 800000, taxAmount: 0, adjustment: -800000, reason: '豁免股息收入', category: '收入' },
  { id: 3, item: '递延税项变动', bookAmount: 350000, taxAmount: 280000, adjustment: -70000, reason: '暂时性差异', category: '税项' },
  { id: 4, item: '研发费用加计扣除', bookAmount: 1200000, taxAmount: 1800000, adjustment: 600000, reason: '超级扣除率', category: '运营费用' },
  { id: 5, item: '固定资产折旧', bookAmount: 1800000, taxAmount: 2100000, adjustment: 300000, reason: '加速折旧', category: '资本性支出' },
]

const globeCalculation = {
  revenue: 125000000,
  incomeBeforeAdjustment: 18750000,
  totalAdjustments: -370000,
  globeIncome: 18380000,
  substanceIncomeExclude: 2500000,
  adjustedGlobeIncome: 15880000,
  coveredTaxes: 2382000,
  eTR: 0.1501,
  minETR: 0.15,
  topUpTax: 0,
  countries: [
    { name: '香港', income: 12500000, tax: 1062500, etr: 0.085 },
    { name: '新加坡', income: 5880000, tax: 882000, etr: 0.15 },
    { name: '日本', income: 0, tax: 437000, etr: 0.20 },
  ],
}

const aiExplanations = [
  {
    title: 'GloBE 收入计算',
    content: '根据 OECD Pillar Two 规则，GloBE 收入 = 财务报表收入 + 税务调整项。本期收入主要来源于香港地区业务，适用 8.25% 优惠税率。',
  },
  {
    title: '实质所得排除',
    content: '基于工资薪金和有形资产的实质活动排除，本期可排除收入 HKD 2,500,000，降低 Top-up Tax 风险。',
  },
  {
    title: 'ETR 分析',
    content: '经调整有效税率 (ETR) 为 15.01%，恰好达到 15% 全球最低税率门槛，无需缴纳 Top-up Tax。',
  },
]

export function PillarTwoPage() {
  const [activeTab, setActiveTab] = useState('calculation')
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcComplete, setCalcComplete] = useState(true)

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setCalcComplete(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Pillar Two HKMTT 计算工作台"
        subtitle="全球最低税率自动化计算与合规分析"
      />

      <div className="p-6 space-y-6">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'GloBE 收入', value: formatCurrency(globeCalculation.globeIncome), icon: DollarSign, trend: 'up', color: 'text-primary' },
            { label: '有效税率 (ETR)', value: formatPercent(globeCalculation.etr), icon: Percent, trend: 'neutral', color: 'text-success' },
            { label: 'Top-up Tax', value: formatCurrency(globeCalculation.topUpTax), icon: Calculator, trend: 'down', color: 'text-success' },
            { label: '涉税管辖区', value: '3', icon: Globe, trend: 'neutral', color: 'text-info' },
          ].map((stat) => (
            <Card key={stat.label} hover>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 'bg-primary/10')}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-success" />}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 主要内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：计算区域 */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="calculation">计算过程</TabsTrigger>
                <TabsTrigger value="charts" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  可视化分析
                </TabsTrigger>
                <TabsTrigger value="adjustments">调整项明细</TabsTrigger>
                <TabsTrigger value="jurisdiction">管辖区分析</TabsTrigger>
              </TabsList>

              <TabsContent value="calculation" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      GloBE 收入计算
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 计算步骤 */}
                      {[
                        { label: '财务报表收入', value: globeCalculation.revenue, note: '合并报表确认' },
                        { label: '调整前 GloBE 收入', value: globeCalculation.incomeBeforeAdjustment, note: '占比 15%' },
                        { label: '税务调整项合计', value: globeCalculation.totalAdjustments, note: '5项调整', negative: true },
                        { label: 'GloBE 收入', value: globeCalculation.globeIncome, note: '调整后', highlight: true },
                        { label: '实质活动排除', value: -globeCalculation.substanceIncomeExclude, note: '工资+资产', negative: true },
                        { label: '经调整 GloBE 收入', value: globeCalculation.adjustedGlobeIncome, note: '最终基准', highlight: true, final: true },
                      ].map((step, index) => (
                        <div
                          key={step.label}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg transition-colors',
                            step.final ? 'bg-primary/5 border-2 border-primary/20' : 'bg-muted/30',
                            step.highlight && !step.final && 'bg-primary/5 border border-primary/10'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                              step.final ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{step.label}</p>
                              <p className="text-xs text-muted-foreground">{step.note}</p>
                            </div>
                          </div>
                          <p className={cn(
                            'font-mono font-semibold',
                            step.final ? 'text-primary text-xl' : 'text-foreground',
                            step.negative && 'text-destructive'
                          )}>
                            {step.negative && step.value > 0 ? '-' : ''}{formatCurrency(Math.abs(step.value))}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* ETR 计算 */}
                    <div className="mt-6 p-4 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="font-medium text-success">ETR 达标 - 无 Top-up Tax</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Covered Taxes</p>
                          <p className="font-mono font-semibold">{formatCurrency(globeCalculation.coveredTaxes)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">经调整 GloBE 收入</p>
                          <p className="font-mono font-semibold">{formatCurrency(globeCalculation.adjustedGlobeIncome)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">有效税率 (ETR)</p>
                          <p className="font-mono font-semibold text-success">{formatPercent(globeCalculation.etr)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="mt-4 space-y-6">
                {/* ETR 仪表盘 + 收入构成 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ETR 仪表盘 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Percent className="w-5 h-5 text-primary" />
                        ETR 仪表盘
                      </CardTitle>
                      <CardDescription>有效税率 vs 全球最低税率 15%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadialBarChart
                          cx="50%" cy="50%"
                          innerRadius="60%" outerRadius="90%"
                          startAngle={180} endAngle={0}
                          data={etrGaugeData}
                        >
                          <RadialBar
                            dataKey="value"
                            cornerRadius={10}
                            background={{ fill: '#f1f5f9' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="text-center -mt-16">
                        <p className="text-3xl font-bold text-green-600">15.01%</p>
                        <p className="text-sm text-muted-foreground mt-1">ETR 达标 (≥ 15%)</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">无需 Top-up Tax</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GloBE 收入构成饼图 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        GloBE 收入构成
                      </CardTitle>
                      <CardDescription>按管辖区分布</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={incomeCompositionData.filter(d => d.value > 0)}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {incomeCompositionData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {incomeCompositionData.map(d => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 管辖区 ETR 对比柱状图 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      管辖区 ETR 对比
                    </CardTitle>
                    <CardDescription>各管辖区收入、税款及有效税率对比 (单位: 百万 HKD / %)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={jurisdictionChartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: '百万 HKD', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 25]} label={{ value: 'ETR %', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#94a3b8' } }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar yAxisId="left" dataKey="income" name="GloBE 收入" fill="#f97316" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="tax" name="已缴税款" fill="#d97706" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="etr" name="ETR %" fill="#eab308" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    {/* 15% 基准线说明 */}
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                      <div className="w-8 h-0.5 bg-red-400 border-dashed" />
                      <span>全球最低税率 15% 基准线</span>
                      <span className="text-orange-500 font-medium ml-3">香港 ETR 8.5% &lt; 15%</span>
                      <span className="mx-1">|</span>
                      <span className="text-green-500 font-medium">新加坡/日本 ETR ≥ 15%</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjustments" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      调整项明细
                    </CardTitle>
                    <CardDescription>
                      AI 已自动识别 5 项需要调整的项目
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>调整项目</TableHead>
                          <TableHead>类别</TableHead>
                          <TableHead className="text-right">账面金额</TableHead>
                          <TableHead className="text-right">税务金额</TableHead>
                          <TableHead className="text-right">调整额</TableHead>
                          <TableHead>原因</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adjustmentItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(item.bookAmount)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(item.taxAmount)}</TableCell>
                            <TableCell className={cn(
                              'text-right font-mono font-semibold',
                              item.adjustment > 0 ? 'text-success' : 'text-destructive'
                            )}>
                              {item.adjustment > 0 ? '+' : ''}{formatCurrency(item.adjustment)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jurisdiction" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      管辖区分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {globeCalculation.countries.map((country, index) => (
                        <div key={country.name} className="p-4 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-primary" />
                              <span className="font-medium">{country.name}</span>
                            </div>
                            <Badge variant={country.etr < 0.15 ? 'warning' : 'success'}>
                              ETR: {formatPercent(country.etr)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">GloBE 收入</p>
                              <p className="font-mono">{formatCurrency(country.income)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">已缴税款</p>
                              <p className="font-mono">{formatCurrency(country.tax)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Top-up Tax</p>
                              <p className="font-mono font-semibold text-success">HKD 0.00</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧：AI 面板 */}
          <div className="space-y-4">
            <Card hover className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI 计算说明
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiExplanations.map((exp, index) => (
                  <div key={index} className="p-3 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <CardTitle className="text-base">操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleCalculate} loading={isCalculating}>
                  <Calculator className="w-4 h-4 mr-2" />
                  重新计算
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  导出计算书
                </Button>
              </CardContent>
            </Card>

            {/* 风险提示 */}
            <Card hover className="border-warning/30 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  风险提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    • 香港地区 ETR 为 8.5%，低于 15% 门槛
                  </p>
                  <p className="text-muted-foreground">
                    • 通过实质活动排除已避免 Top-up Tax
                  </p>
                  <p className="text-muted-foreground">
                    • 建议持续监控实质活动指标
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 下一步 */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline">
            保存计算
          </Button>
          <Button>
            继续利得税计算
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
