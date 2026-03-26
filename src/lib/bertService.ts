import type {
  BertEmbedding,
  BertConfig,
  BertMatchResult,
  BertMatchConfig,
  BertServiceStatus,
  BertCacheEntry,
  BertBatchRequest,
  BertBatchResponse,
  ComparisonDetail,
  MatchSuggestion,
  SemanticCategory,
} from '@/types/bert'
import { logAudit } from './auditLog'

// ============ 默认配置 ============
const DEFAULT_CONFIG: BertConfig = {
  model: 'bert-base-chinese',
  cacheEnabled: true,
  cacheTTL: 3600000, // 1 hour
  batchSize: 32,
  timeout: 30000,
}

const DEFAULT_MATCH_CONFIG: BertMatchConfig = {
  similarityThreshold: {
    high: 0.85,
    medium: 0.70,
    low: 0.50,
  },
  weights: {
    semantic: 0.7,
    lexical: 0.3,
  },
  enableCache: true,
  batchSize: 16,
  parallelProcessing: true,
}

// ============ 内存缓存 ============
let embeddingCache: Map<string, BertCacheEntry> = new Map()
let requestCount = 0
let totalLatency = 0

// ============ BERT 服务类 ============
class BertService {
  private config: BertConfig

  constructor(config?: Partial<BertConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ============ 生成嵌入向量 ============
  async generateEmbedding(text: string): Promise<BertEmbedding> {
    // 检查缓存
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(text)
      if (cached) {
        return cached
      }
    }

    const startTime = Date.now()

    try {
      // 模拟 BERT API 调用
      // 实际生产环境应调用后端 API 或 TensorFlow.js
      const embedding = await this.simulateBertEmbedding(text)

      // 更新统计
      requestCount++
      totalLatency += Date.now() - startTime

      // 存入缓存
      if (this.config.cacheEnabled) {
        this.addToCache(text, embedding)
      }

      // 记录审计日志
      logAudit('AI_SUGGEST', {
        action: 'BERT 嵌入生成',
        text: text.substring(0, 50),
        model: this.config.model,
        dimensions: embedding.dimensions,
      })

      return embedding
    } catch (error) {
      throw new Error(`BERT 嵌入生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // ============ 批量生成嵌入向量 ============
  async generateEmbeddings(request: BertBatchRequest): Promise<BertBatchResponse> {
    const startTime = Date.now()
    const embeddings: BertEmbedding[] = []
    let cached = true

    // 分批处理
    const batches = this.chunkArray(request.texts, this.config.batchSize)

    for (const batch of batches) {
      const batchEmbeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      )
      embeddings.push(...batchEmbeddings)

      // 如果有任何未缓存的结果，标记为非完全缓存
      if (batchEmbeddings.some(e => Date.now() - startTime > 100)) {
        cached = false
      }
    }

    return {
      embeddings,
      processingTime: Date.now() - startTime,
      model: this.config.model,
      cached,
    }
  }

  // ============ 计算语义相似度 ============
  async computeSimilarity(text1: string, text2: string): Promise<number> {
    const [emb1, emb2] = await Promise.all([
      this.generateEmbedding(text1),
      this.generateEmbedding(text2),
    ])

    return this.cosineSimilarity(emb1.vector, emb2.vector)
  }

  // ============ 批量匹配 ============
  async batchMatch(
    sourceTexts: { id: string; text: string }[],
    targetTexts: { id: string; text: string }[],
    config: Partial<BertMatchConfig> = {}
  ): Promise<MatchSuggestion[]> {
    const matchConfig = { ...DEFAULT_MATCH_CONFIG, ...config }
    const suggestions: MatchSuggestion[] = []

    // 生成所有嵌入向量
    const sourceEmbeddings = await this.generateEmbeddings({
      texts: sourceTexts.map(s => s.text),
    })

    const targetEmbeddings = await this.generateEmbeddings({
      texts: targetTexts.map(t => t.text),
    })

    // 计算相似度矩阵
    for (let i = 0; i < sourceTexts.length; i++) {
      const source = sourceTexts[i]
      const sourceEmb = sourceEmbeddings.embeddings[i]

      const matches: MatchSuggestion['suggestions'] = []

      for (let j = 0; j < targetTexts.length; j++) {
        const target = targetTexts[j]
        const targetEmb = targetEmbeddings.embeddings[j]

        // 计算语义相似度
        const semanticScore = this.cosineSimilarity(sourceEmb.vector, targetEmb.vector)

        // 计算词汇相似度 (简单版)
        const lexicalScore = this.computeLexicalSimilarity(source.text, target.text)

        // 综合得分
        const combinedScore =
          matchConfig.weights.semantic * semanticScore +
          matchConfig.weights.lexical * lexicalScore

        // 提取匹配短语
        const matchedPhrases = this.extractMatchedPhrases(source.text, target.text)

        matches.push({
          targetId: target.id,
          targetText: target.text,
          score: combinedScore,
          confidence: this.getConfidenceLevel(combinedScore, matchConfig),
          reason: this.generateMatchReason(semanticScore, lexicalScore, matchedPhrases),
          matchedPhrases,
        })
      }

      // 按得分排序，      matches.sort((a, b) => b.score - a.score)

      // 只保留得分较高的
      suggestions.push({
        sourceId: source.id,
        sourceText: source.text,
        suggestions: matches.filter(m => m.score >= matchConfig.similarityThreshold.low).slice(0, 5),
      })
    }

    return suggestions
  }

  // ============ 详细比较 ============
  async compareDetailed(text1: string, text2: string): Promise<ComparisonDetail> {
    const [emb1, emb2] = await Promise.all([
      this.generateEmbedding(text1),
      this.generateEmbedding(text2),
    ])

    const v1 = emb1.vector
    const v2 = emb2.vector

    return {
      sourceEmbedding: v1,
      targetEmbedding: v2,
      cosineSimilarity: this.cosineSimilarity(v1, v2),
      euclideanDistance: this.euclideanDistance(v1, v2),
      manhattanDistance: this.manhattanDistance(v1, v2),
      dotProduct: this.dotProduct(v1, v2),
      semanticAlignment: this.computeAlignment(v1, v2),
    }
  }

  // ============ 获取服务状态 ============
  getStatus(): BertServiceStatus {
    const entries = Array.from(embeddingCache.values())
    const avgLatency = requestCount > 0 ? totalLatency / requestCount : 0

    return {
      isReady: true,
      model: this.config.model,
      lastUsed: entries.length > 0
        ? new Date(Math.max(...entries.map(e => e.createdAt.getTime())))
        : undefined,
      requestCount,
      cacheSize: embeddingCache.size,
      averageLatency: avgLatency,
    }
  }

  // ============ 清除缓存 ============
  clearCache(): void {
    embeddingCache.clear()
  }

  // ============ 私有方法 ============

  // 模拟 BERT 嵌入生成
  private async simulateBertEmbedding(text: string): Promise<BertEmbedding> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))

    // 生成伪随机但确定性的嵌入向量
    // 实际生产环境应使用 TensorFlow.js 或调用 API
    const dimensions = 768 // BERT-base 维度
    const vector: number[] = []

    // 使用文本特征生成伪嵌入
    const features = this.extractTextFeatures(text)
    for (let i = 0; i < dimensions; i++) {
      // 基于文本特征和位置生成值
      const value = Math.sin(features.hash * (i + 1) * 0.01) * Math.cos(features.length * i * 0.001)
      vector.push(value)
    }

    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
    const normalizedVector = vector.map(v => v / norm)

    return {
      text,
      vector: normalizedVector,
      dimensions,
      model: this.config.model,
      generatedAt: new Date(),
    }
  }

  // 提取文本特征
  private extractTextFeatures(text: string): { hash: number; length: number; wordCount: number } {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    return {
      hash: Math.abs(hash),
      length: text.length,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
    }
  }

  // 余弦相似度
  private cosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0

    let dotSum = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < v1.length; i++) {
      dotSum += v1[i] * v2[i]
      norm1 += v1[i] * v1[i]
      norm2 += v2[i] * v2[i]
    }

    if (norm1 === 0 || norm2 === 0) return 0
    return dotSum / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  // 欧氏距离
  private euclideanDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return Infinity

    let sum = 0
    for (let i = 0; i < v1.length; i++) {
      sum += Math.pow(v1[i] - v2[i], 2)
    }
    return Math.sqrt(sum)
  }

  // 曼哈顿距离
  private manhattanDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return Infinity

    let sum = 0
    for (let i = 0; i < v1.length; i++) {
      sum += Math.abs(v1[i] - v2[i])
    }
    return sum
  }

  // 点积
  private dotProduct(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0

    let sum = 0
    for (let i = 0; i < v1.length; i++) {
      sum += v1[i] * v2[i]
    }
    return sum
  }

  // 计算对齐向量
  private computeAlignment(v1: number[], v2: number[]): number[] {
    const alignment: number[] = []
    for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
      alignment.push(1 - Math.abs(v1[i] - v2[i]))
    }
    return alignment
  }

  // 词汇相似度
  private computeLexicalSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 1))
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 1))

    if (words1.size === 0 && words2.size === 0) return 1
    if (words1.size === 0 || words2.size === 0) return 0

    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  // 提取匹配短语
  private extractMatchedPhrases(text1: string, text2: string): string[] {
    const phrases: string[] = []
    const words1 = text1.split(/\s+/)
    const words2 = new Set(text2.split(/\s+/))

    for (const word of words1) {
      if (word.length >= 2 && words2.has(word)) {
        phrases.push(word)
      }
    }

    return [...new Set(phrases)]
  }

  // 获取置信度级别
  private getConfidenceLevel(
    score: number,
    config: BertMatchConfig
  ): 'high' | 'medium' | 'low' {
    if (score >= config.similarityThreshold.high) return 'high'
    if (score >= config.similarityThreshold.medium) return 'medium'
    return 'low'
  }

  // 生成匹配原因
  private generateMatchReason(
    semanticScore: number,
    lexicalScore: number,
    matchedPhrases: string[]
  ): string {
    const reasons: string[] = []

    if (semanticScore >= 0.85) {
      reasons.push('语义高度相似')
    } else if (semanticScore >= 0.70) {
      reasons.push('语义中度相似')
    }

    if (lexicalScore >= 0.5) {
      reasons.push('词汇重叠度高')
    }

    if (matchedPhrases.length > 0) {
      reasons.push(`匹配关键词: ${matchedPhrases.slice(0, 3).join(', ')}`)
    }

    return reasons.join('；') || '相似度较低'
  }

  // 缓存操作
  private getFromCache(text: string): BertEmbedding | null {
    const key = this.getCacheKey(text)
    const entry = embeddingCache.get(key)

    if (!entry) return null

    // 检查是否过期
    if (Date.now() > entry.expiresAt.getTime()) {
      embeddingCache.delete(key)
      return null
    }

    // 更新命中次数
    entry.hitCount++
    return entry.embedding
  }

  private addToCache(text: string, embedding: BertEmbedding): void {
    const key = this.getCacheKey(text)
    const now = Date.now()

    embeddingCache.set(key, {
      key,
      embedding,
      createdAt: new Date(),
      expiresAt: new Date(now + (this.config.cacheTTL || 3600000)),
      hitCount: 0,
    })
  }

  private getCacheKey(text: string): string {
    return `${this.config.model}:${text.substring(0, 100)}`
  }

  // 数组分块
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// ============ 导出单例和工具函数 ============
export function createBertService(config?: Partial<BertConfig>): BertService {
  return new BertService(config)
}

// 默认服务实例
export const bertService = new BertService()

// 便捷函数
export async function computeBertSimilarity(text1: string, text2: string): Promise<number> {
  return bertService.computeSimilarity(text1, text2)
}

export async function generateBertEmbedding(text: string): Promise<BertEmbedding> {
  return bertService.generateEmbedding(text)
}

export function getBertServiceStatus(): BertServiceStatus {
  return bertService.getStatus()
}
