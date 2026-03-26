import React, { useState, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Brain,
  Sparkles,
  Download,
  ChevronRight,
  Edit3,
  Eye,
  Wand2,
  Copy,
  Printer,
  Plus,
  Trash2,
  RefreshCw,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const letterTemplate = `香港税务顾问有限公司
Hong Kong Tax Advisory Limited

日期：2024年3月26日

致：ABC Trading Limited 董事会

尊敬的董事：

关于：2024/25 年度利得税报税表 (IRD51) 填报事宜

我们已完成 贵公司 2024/25 年度利得税报税表的编制工作，现将主要事项汇报如下：

一、税务计算概要

1. 应评税利润：HKD 13,900,000
2. 适用税率：首 HKD 2,000,000 @ 8.25%；余额 @ 16.5%
3. 应缴利得税：HKD 2,138,500
4. 已缴暂缴税：HKD 1,800,000
5. 应补缴税款：HKD 338,500

二、主要调整事项

1. 不可扣减费用加回：HKD 580,000
   - 娱乐费用：HKD 180,000
   - 罚款及罚金：HKD 45,000
   - 私人性质支出：HKD 95,000
   - 关联方利息（超独立交易）：HKD 260,000

2. 折旧免税额：HKD 3,880,000
   - 机器及设备年度免税额：HKD 1,700,000
   - 工业建筑物年度免税额：HKD 480,000
   - 商业建筑物年度免税额：HKD 200,000
   - 环保设施初期免税额：HKD 1,500,000

三、风险提示

1. Pillar Two 合规
   根据全球最低税率规则，贵公司的有效税率为 15.01%，符合 15% 门槛要求，暂无 Top-up Tax 风险。

2. 转让定价
   建议复核关联方交易定价，确保符合独立交易原则。

四、提交期限

报税表提交截止日期：2024年5月15日
税款缴纳截止日期：2024年5月15日

如有任何疑问，请随时与我们联系。

此致

香港税务顾问有限公司
执业税务师`

const aiSuggestions = [
  {
    type: 'summary',
    title: '本期税负摘要',
    content: '2024/25年度应缴利得税为 HKD 2,138,500，较上年度增加 8.5%，主要由于应评税利润增长所致。',
  },
  {
    type: 'risk',
    title: '风险事项提醒',
    content: '识别到 2 项潜在风险：1) 关联方利息超出独立交易原则；2) Pillar Two ETR 接近门槛。建议复核并留存文档。',
  },
  {
    type: 'planning',
    title: '税务筹划建议',
    content: '建议考虑：1) 利用研发费用加计扣除；2) 评估资产购置时机以优化折旧免税额；3) 复核转让定价政策。',
  },
]

export function CoverLetterPage() {
  const [activeTab, setActiveTab] = useState('edit')
  const [letterContent, setLetterContent] = useState(letterTemplate)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [customSections, setCustomSections] = useState<string[]>([])
  const editorRef = useRef<HTMLDivElement>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const handleAddSection = () => {
    const newSection = `\n\n五、补充说明\n\n[请在此处添加您的补充内容]\n`
    setLetterContent(prev => prev + newSection)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="AI Cover Letter 生成"
        subtitle="基于计算结果自动生成专业税务信函"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：编辑器 */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="edit">编辑模式</TabsTrigger>
                  <TabsTrigger value="preview">预览模式</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddSection}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加段落
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新生成
                  </Button>
                </div>
              </div>

              <TabsContent value="edit" className="mt-4">
                <Card hover>
                  <CardContent className="p-0">
                    <div className="border-b p-3 flex items-center justify-between bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Badge variant="ai" dot>
                          AI 生成
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          字数：{letterContent.length} | 段落：12
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div
                      ref={editorRef}
                      className="min-h-[600px] p-6 focus:outline-none font-mono text-sm whitespace-pre-wrap leading-relaxed"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setLetterContent(e.currentTarget.textContent || '')}
                    >
                      {letterContent}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card hover>
                  <CardContent className="p-8">
                    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-12 min-h-[800px]">
                      <div className="text-center mb-8 pb-4 border-b">
                        <h2 className="text-lg font-semibold">香港税务顾问有限公司</h2>
                        <p className="text-sm text-muted-foreground">Hong Kong Tax Advisory Limited</p>
                      </div>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">
                        {letterContent}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧：AI 面板 */}
          <div className="space-y-4">
            {/* AI 生成控制 */}
            <Card hover className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI 信函生成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  AI 已基于计算结果自动生成专业税务信函，包含税负摘要、调整事项及风险提示。
                </p>
                <Button className="w-full" onClick={handleGenerate} loading={isGenerating}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  重新生成信函
                </Button>
              </CardContent>
            </Card>

            {/* AI 建议插入 */}
            <Card hover>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI 内容建议
                </CardTitle>
                <CardDescription>
                  点击插入到信函中
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              suggestion.type === 'risk' ? 'warning' :
                              suggestion.type === 'summary' ? 'info' : 'success'
                            }
                            className="text-[10px]"
                          >
                            {suggestion.type === 'summary' && '摘要'}
                            {suggestion.type === 'risk' && '风险'}
                            {suggestion.type === 'planning' && '建议'}
                          </Badge>
                          <span className="font-medium text-sm">{suggestion.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{suggestion.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 导出选项 */}
            <Card hover>
              <CardHeader>
                <CardTitle className="text-base">导出格式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  导出 PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Copy className="w-4 h-4 mr-2" />
                  复制到剪贴板
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="w-4 h-4 mr-2" />
                  打印预览
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 下一步 */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline">
            保存草稿
          </Button>
          <Button>
            前往导出中心
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
