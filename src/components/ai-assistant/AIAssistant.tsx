import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  FileText,
  Calculator,
  Database,
  HelpCircle,
  Sparkles,
  Loader2,
  Bot,
  User,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage, ChatAction, AISuggestion } from '@/types/ai-assistant'
import { zhipuService } from '@/lib/zhipuService'

interface AIAssistantProps {
  onNavigate?: (pageId: string) => void
  onSearch?: (query: string) => void
}

// 快捷操作建议
const quickSuggestions = [
  { id: '1', icon: 'Database', label: '查看 ABC 集团数据', category: 'data' as const },
  { id: '2', icon: 'Calculator', label: '计算利得税', category: 'navigate' as const },
  { id: '3', icon: 'BookOpen', label: '支柱二法规解读', category: 'search' as const },
  { id: '4', icon: 'FileText', label: 'XBRL 填报指南', category: 'help' as const },
]

export function AIAssistant({ onNavigate, onSearch }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是您的税务 AI 助手。我可以帮您：\n\n• 查询利得税、支柱二相关法规\n• 导航到不同功能页面\n• 筛选和分析数据\n• 回答税务相关问题\n\n请问有什么可以帮您？',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 调用真实 AI 响应
  const getAIResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true)

    try {
      // 构建消息历史（只保留最近几条）
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      // 添加当前用户消息
      chatHistory.push({ role: 'user', content: userMessage })

      // 调用智普 AI
      const response = await zhipuService.chat(chatHistory)

      // 解析响应，提取操作按钮
      const actions: ChatMessage['actions'] = []
      const lowerMsg = userMessage.toLowerCase()

      // 根据用户消息添加快捷操作
      if (lowerMsg.includes('利得税') || lowerMsg.includes('profits tax')) {
        actions.push({
          type: 'navigate',
          label: '前往利得税计算',
          data: { pageId: 'profits-tax' },
        })
      } else if (lowerMsg.includes('支柱二') || lowerMsg.includes('pillar two')) {
        actions.push({
          type: 'navigate',
          label: '前往 Pillar Two',
          data: { pageId: 'pillar-two' },
        })
      } else if (lowerMsg.includes('xbrl')) {
        actions.push({
          type: 'navigate',
          label: '前往 Return 填报',
          data: { pageId: 'return-filling' },
        })
      } else if (lowerMsg.includes('数据') || lowerMsg.includes('上传')) {
        actions.push({
          type: 'navigate',
          label: '前往数据上传',
          data: { pageId: 'upload' },
        })
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI 响应失败:', error)
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [messages])

  // 发送消息
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setSuggestions([])

    getAIResponse(inputValue.trim())
  }, [inputValue, getAIResponse])

  // 处理快捷操作
  const handleQuickAction = useCallback((action: typeof quickSuggestions[0]) => {
    const messages: Record<string, string> = {
      '1': '帮我查看 ABC 集团的税务数据',
      '2': '如何计算利得税？',
      '3': '请解读支柱二相关法规',
      '4': 'XBRL 填报有什么要求？',
    }
    setInputValue(messages[action.id] || '')
  }, [])

  // 处理消息中的操作
  const handleMessageAction = useCallback((action: ChatAction) => {
    if (action.type === 'navigate' && action.data.pageId) {
      onNavigate?.(action.data.pageId)
      setIsOpen(false)
    }
  }, [onNavigate])

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Database,
      Calculator,
      BookOpen,
      FileText,
    }
    return icons[iconName] || HelpCircle
  }

  return (
    <>
      {/* 悬浮气泡按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-50 w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'transition-all duration-500 ease-out',
          'hover:scale-110 active:scale-95',
          'group',
          isOpen
            ? 'right-[420px] bottom-6'
            : 'right-6 bottom-6'
        )}
        style={{
          background: isOpen
            ? 'hsl(var(--background))'
            : 'rgba(80, 80, 80, 0.75)',
          boxShadow: isOpen
            ? 'var(--shadow-card)'
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-muted-foreground" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-white/80 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}

        {/* 脉冲动画 */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'hsl(0, 0%, 40% / 0.4)' }}
          />
        )}
      </button>

      {/* 抽屉面板 */}
      <div
        className={cn(
          'fixed z-40 right-0 top-0 h-screen',
          'flex flex-col',
          'bg-background border-l border-border',
          'transition-all duration-500 ease-out',
          'shadow-2xl',
          isOpen ? 'w-[400px] translate-x-0' : 'w-[400px] translate-x-full'
        )}
      >
        {/* 头部 */}
        <div
          className="flex-shrink-0 p-4 border-b border-border"
          style={{ background: 'linear-gradient(135deg, hsl(0, 0%, 45%), hsl(0, 0%, 35%))' }}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">税务 AI 助手</h3>
              <p className="text-xs text-white/80">随时为您解答税务问题</p>
            </div>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              {/* 头像 */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-foreground" />
                )}
              </div>
              
              {/* 消息内容 */}
              <div
                className={cn(
                  'flex-1 max-w-[85%]',
                  message.role === 'user' ? 'text-right' : ''
                )}
              >
                <div
                  className={cn(
                    'inline-block px-4 py-3 rounded-2xl text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-muted rounded-tl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* 操作按钮 */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMessageAction(action)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* 打字指示器 */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 快捷操作 */}
        {messages.length === 1 && (
          <div className="flex-shrink-0 p-4 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-3">快速开始</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((action) => {
                const IconComponent = getIconComponent(action.icon)
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <span className="text-xs text-foreground truncate">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="输入问题或指令..."
                disabled={isTyping}
                className="w-full px-4 py-3 pr-10 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  'absolute right-1 top-1/2 -translate-y-1/2',
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'transition-all duration-200',
                  inputValue.trim() && !isTyping
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            按 Enter 发送 · 支持法规查询、页面导航、数据分析
          </p>
        </div>
      </div>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
