import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
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
  Minus,
  Plus,
  RefreshCw,
  Building2,
  Percent,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList,
} from 'recharts'

// 税负结构饼图数据 - 暖色调系
const taxStructureData = [
  { name: '优惠税率 (8.25%)', value: 165000, color: '#d97706' },
  { name: '标准税率 (16.5%)', value: 1963500, color: '#f97316' },
]

// 利润瀑布图数据 - 暖色调系
const profitWaterfallData = [
  { name: '营业额', value: 125, fill: '#f97316' },
  { name: '销货成本', value: -85, fill: '#dc2626' },
  { name: '毛利', value: 40, fill: '#84cc16' },
  { name: '经营费用', value: -20, fill: '#dc2626' },
  { name: '折旧摊销', value: -3, fill: '#dc2626' },
  { name: '其他调整', value: -3.1, fill: '#dc2626' },
  { name: '应评税利润', value: 13.9, fill: '#c2410c' },
]

// 不可扣减费用构成 - 暖色调系
const nonDeductibleChartData = [
  { name: '关联方利息', value: 260000, color: '#dc2626' },
  { name: '娱乐费用', value: 180000, color: '#f97316' },
  { name: '私人支出', value: 95000, color: '#eab308' },
  { name: '罚款罚金', value: 45000, color: '#fb923c' },
]

// 折旧免税额构成 - 暖色调系
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
  const [activeTab, setActiveTab] = useState('computation')
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => setIsCalculating(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="香港利得税计算工作台"
        subtitle="自动化计算应评税利润及税额"
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
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 主内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="computation">税额计算</TabsTrigger>
                <TabsTrigger value="charts" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  可视化分析
                </TabsTrigger>
                <TabsTrigger value="nonDeductible">不可扣减项</TabsTrigger>
                <TabsTrigger value="depreciation">折旧免税额</TabsTrigger>
              </TabsList>

              <TabsContent value="computation" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      利得税计算表
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 计算步骤 */}
                      {[
                        { label: '账面净利润', value: profitTaxData.netProfit, note: '财务报表' },
                        { label: '加：不可扣减费用', value: profitTaxData.nonDeductible, note: '4项调整', type: 'add' },
                        { label: '减：豁免收入', value: profitTaxData.taxExemptIncome, note: '离岸收入', type: 'subtract' },
                        { label: '应评税利润', value: profitTaxData.assessableProfit, note: '调整后', highlight: true },
                      ].map((step, index) => (
                        <div
                          key={step.label}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg',
                            step.highlight ? 'bg-primary/5 border-2 border-primary/20' : 'bg-muted/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {step.type === 'add' && <Plus className="w-4 h-4 text-destructive" />}
                            {step.type === 'subtract' && <Minus className="w-4 h-4 text-success" />}
                            {!step.type && <div className="w-4" />}
                            <div>
                              <p className="font-medium">{step.label}</p>
                              <p className="text-xs text-muted-foreground">{step.note}</p>
                            </div>
                          </div>
                          <p className={cn(
                            'font-mono font-semibold',
                            step.highlight && 'text-primary text-lg'
                          )}>
                            {formatCurrency(step.value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 分档计算 */}
                    <div className="mt-6 p-4 rounded-lg bg-success/5 border border-success/20">
                      <p className="font-medium mb-4">分档税额计算</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">首 HKD 2,000,000 @ 8.25%</span>
                          <span className="font-mono">{formatCurrency(2000000)}</span>
                          <span className="font-mono font-semibold text-success">{formatCurrency(165000)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">余额 @ 16.5%</span>
                          <span className="font-mono">{formatCurrency(11900000)}</span>
                          <span className="font-mono font-semibold">{formatCurrency(1963500)}</span>
                        </div>
                        <div className="border-t border-success/20 pt-3 flex items-center justify-between">
                          <span className="font-medium">应缴利得税</span>
                          <span className="font-mono font-bold text-lg text-primary">{formatCurrency(profitTaxData.taxPayable)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="mt-4 space-y-6">
                {/* 税负结构饼图 + 利润瀑布图 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 税负结构饼图 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Percent className="w-5 h-5 text-primary" />
                        税负结构
                      </CardTitle>
                      <CardDescription>优惠税率 vs 标准税率税款构成</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={taxStructureData}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {taxStructureData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-2">
                        {taxStructureData.map(d => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-3 p-2 bg-muted/30 rounded-lg">
                        <span className="text-sm text-muted-foreground">应缴总税款: </span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(2128500)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 不可扣减费用构成 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        不可扣减费用构成
                      </CardTitle>
                      <CardDescription>AI 识别的 4 项不可扣减支出</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={nonDeductibleChartData}
                            cx="50%" cy="50%"
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {nonDeductibleChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {nonDeductibleChartData.map(d => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 利润瀑布图 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      利润计算瀑布图
                    </CardTitle>
                    <CardDescription>从营业额到应评税利润的计算流程 (单位: 百万 HKD)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={profitWaterfallData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} label={{ value: '百万 HKD', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
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

                {/* 折旧免税额构成 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      折旧免税额分布
                    </CardTitle>
                    <CardDescription>各类资产折旧免税额构成</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={depreciationChartData} layout="vertical" barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" name="免税额" radius={[0, 4, 4, 0]}>
                          {depreciationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-sm text-muted-foreground">总免税额: </span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(3880000)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nonDeductible" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      不可扣减费用明细
                    </CardTitle>
                    <CardDescription>
                      AI 自动识别需要加回的费用项目
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>费用项目</TableHead>
                          <TableHead className="text-right">金额</TableHead>
                          <TableHead>原因</TableHead>
                          <TableHead>税务条款</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nonDeductibleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item}</TableCell>
                            <TableCell className="text-right font-mono text-destructive">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.section}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/30">
                          <TableCell className="font-semibold">合计</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-destructive">
                            {formatCurrency(profitTaxData.nonDeductible)}
                          </TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="depreciation" className="mt-4">
                <Card hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      折旧免税额计算
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>资产类别</TableHead>
                          <TableHead className="text-right">池结余/成本</TableHead>
                          <TableHead>免税额率</TableHead>
                          <TableHead className="text-right">免税额</TableHead>
                          <TableHead>类型</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {depreciationAllowances.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(item.poolBalance || item.cost || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.rate}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-success">
                              {formatCurrency(item.allowance)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.type}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/30">
                          <TableCell className="font-semibold">合计免税额</TableCell>
                          <TableCell colSpan={2} />
                          <TableCell className="text-right font-mono font-bold text-success">
                            {formatCurrency(3880000)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI 面板 */}
          <div className="space-y-4">
            <Card hover className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI 调整说明
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiAdjustments.map((adj, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg',
                      adj.type === 'success' && 'bg-success/5 border border-success/20',
                      adj.type === 'warning' && 'bg-warning/5 border border-warning/20',
                      adj.type === 'info' && 'bg-info/5 border border-info/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {adj.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                      {adj.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />}
                      {adj.type === 'info' && <Sparkles className="w-4 h-4 text-info mt-0.5" />}
                      <div>
                        <p className="font-medium text-sm">{adj.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{adj.description}</p>
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
                  导出计算表
                </Button>
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
            继续 Return 填报
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
