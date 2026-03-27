// 智普 AI 服务
// 文档: https://open.bigmodel.cn/dev/api

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ZhipuChatRequest {
  model: string
  messages: ZhipuMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ZhipuChatResponse {
  id: string
  created: number
  model: string
  choices: {
    index: number
    finish_reason: string
    message: ZhipuMessage
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// 系统提示词 - 税务 AI 助手角色
const SYSTEM_PROMPT = `你是香港税务 AI 助手，专门帮助用户处理香港税务相关问题。你的专业领域包括：

1. **利得税 (Profits Tax)**
   - 香港利得税率为 16.5%
   - 可扣减费用和不可扣减费用的区分
   - 税务调整项目的计算

2. **支柱二 / Pillar Two / GloBE**
   - OECD 全球最低税率框架
   - 15% 有效最低税率
   - 香港 HKMTT 立法
   - Top-up Tax 计算

3. **XBRL 填报**
   - 香港税务局要求的财务报告格式
   - 自动化填报流程

4. **税务合规**
   - 香港税务条例 (IRO) 相关条款
   - 税务申报要求

回答时请：
- 使用中文回答
- 简洁明了，重点突出
- 如涉及法规条款，请引用具体条文
- 如果用户需要进一步操作，可以建议他们前往相关页面

如果问题超出税务范围，请礼貌说明并引导回税务话题。`

class ZhipuService {
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = import.meta.env.VITE_ZHIPU_API_KEY || ''
    this.model = import.meta.env.VITE_ZHIPU_MODEL || 'glm-4-flash'
  }

  async chat(messages: ZhipuMessage[]): Promise<string> {
    if (!this.apiKey) {
      console.error('智普 API Key 未配置')
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '')
    }

    const request: ZhipuChatRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    }

    try {
      const response = await fetch(ZHIPU_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('智普 API 错误:', response.status, errorText)
        return this.getFallbackResponse(messages[messages.length - 1]?.content || '')
      }

      const data: ZhipuChatResponse = await response.json()
      return data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
    } catch (error) {
      console.error('智普 API 调用失败:', error)
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '')
    }
  }

  // 备用响应 - 当 API 调用失败时使用
  private getFallbackResponse(userMessage: string): string {
    const lowerMsg = userMessage.toLowerCase()

    if (lowerMsg.includes('利得税') || lowerMsg.includes('profits tax')) {
      return '利得税是香港对在本港经营业务的公司征收的税项，税率为 16.5%。\n\n我可以帮您：\n1. 导航到利得税计算页面\n2. 查询利得税相关法规\n3. 分析当前项目的利得税数据'
    } else if (lowerMsg.includes('支柱二') || lowerMsg.includes('pillar two') || lowerMsg.includes('globe')) {
      return '支柱二是 OECD 制定的全球最低税率框架，确保大型跨国企业至少缴纳 15% 的有效税率。\n\n我可以帮您：\n1. 计算 GloBE 收入和 Top-up Tax\n2. 查看相关法规条款\n3. 分析集团适用性'
    } else if (lowerMsg.includes('xbrl')) {
      return 'XBRL（可扩展商业报告语言）是一种标准化的财务数据报告格式。香港税务局要求特定纳税人使用 XBRL 格式提交报税表。'
    } else {
      return '抱歉，AI 服务暂时不可用。请稍后再试，或者您可以尝试问我关于利得税、支柱二、XBRL 等税务问题。'
    }
  }

  // 检查 API 是否配置
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export const zhipuService = new ZhipuService()
