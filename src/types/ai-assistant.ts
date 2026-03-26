// ============ AI 助手相关类型 ============

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: ChatAction[]
}

export interface ChatAction {
  type: 'navigate' | 'search' | 'filter' | 'command'
  label: string
  data: Record<string, any>
}

export interface QuickAction {
  id: string
  icon: string
  label: string
  description: string
  category: 'navigate' | 'search' | 'data' | 'help'
  action: () => void
}

export interface AISuggestion {
  id: string
  type: 'page' | 'regulation' | 'data' | 'action'
  title: string
  description?: string
  icon?: string
  metadata?: Record<string, any>
}

export interface SearchResults {
  regulations: RegulationResult[]
  pages: PageResult[]
  data: DataResult[]
}

export interface RegulationResult {
  id: string
  title: string
  source: '利得税' | '支柱二' | 'XBRL' | '税务条例'
  content: string
  relevance: number
}

export interface PageResult {
  id: string
  title: string
  description: string
  path: string
}

export interface DataResult {
  id: string
  type: string
  name: string
  value: string
  entityId?: string
  groupId?: string
}
