// ============ BERT 嵌入相关类型 ============

export interface BertEmbedding {
  text: string
  vector: number[]
  dimensions: number
  model: string
  generatedAt: Date
}

export interface BertConfig {
  apiUrl?: string
  apiKey?: string
  model: 'bert-base-chinese' | 'bert-base-multilingual' | 'sentence-transformers' | 'custom'
  cacheEnabled: boolean
  cacheTTL?: number  // milliseconds
  batchSize: number
  timeout: number
}

// ============ 语义匹配相关类型 ============
export interface BertMatchResult {
  id: string
  sourceText: string
  targetText: string
  similarity: number
  confidence: 'high' | 'medium' | 'low'
  embeddingDistance: number
  semanticScore: number
  lexicalScore: number
  combinedScore: number
  matchedPhrases: string[]
  semanticCategories: SemanticCategory[]
  requiresReview: boolean
  reviewReason?: string
}

export interface SemanticCategory {
  name: string
  confidence: number
  keywords: string[]
}

// ============ 批量处理相关类型 ============
export interface BertBatchRequest {
  texts: string[]
  options?: {
    normalize?: boolean
    includeRawVectors?: boolean
  }
}

export interface BertBatchResponse {
  embeddings: BertEmbedding[]
  processingTime: number
  model: string
  cached: boolean
}

// ============ 匹配配置 ============
export interface BertMatchConfig {
  similarityThreshold: {
    high: number      // >= 0.85
    medium: number    // >= 0.70
    low: number       // >= 0.50
  }
  weights: {
    semantic: number   // BERT 语义相似度权重
    lexical: number    // 词汇相似度权重 (余弦/Jaccard)
  }
  enableCache: boolean
  batchSize: number
  parallelProcessing: boolean
}

// ============ BERT 服务状态 ============
export interface BertServiceStatus {
  isReady: boolean
  model: string
  lastUsed?: Date
  requestCount: number
  cacheSize: number
  averageLatency: number
  error?: string
}

// ============ 语义分析结果 ============
export interface SemanticAnalysisResult {
  text: string
  embedding: BertEmbedding
  categories: SemanticCategory[]
  entities: ExtractedEntity[]
  sentiment?: SentimentResult
}

export interface ExtractedEntity {
  text: string
  type: 'account' | 'amount' | 'date' | 'category' | 'tax_term' | 'other'
  confidence: number
  startPosition: number
  endPosition: number
}

export interface SentimentResult {
  score: number
  label: 'positive' | 'negative' | 'neutral'
  confidence: number
}

// ============ 缓存条目 ============
export interface BertCacheEntry {
  key: string
  embedding: BertEmbedding
  createdAt: Date
  expiresAt: Date
  hitCount: number
}

// ============ 比较结果详情 ============
export interface ComparisonDetail {
  sourceEmbedding: number[]
  targetEmbedding: number[]
  cosineSimilarity: number
  euclideanDistance: number
  manhattanDistance: number
  dotProduct: number
  semanticAlignment: number[]
}

// ============ 匹配建议 ============
export interface MatchSuggestion {
  sourceId: string
  sourceText: string
  suggestions: {
    targetId: string
    targetText: string
    score: number
    confidence: 'high' | 'medium' | 'low'
    reason: string
    matchedPhrases: string[]
  }[]
}
