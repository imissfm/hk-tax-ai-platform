import type {
  MatchResult,
  MatchCandidate,
  PreviousYearData,
  MatchConfig,
  MatchAlgorithm,
  TextPreprocessingConfig,
} from '@/types/semantic-matching'

// ============ 默认配置 ============
const DEFAULT_CONFIG: MatchConfig = {
  similarityThreshold: {
    high: 0.9,
    medium: 0.7,
    low: 0.5,
  },
  requireManualReviewBelow: 0.7,
  maxCandidates: 5,
}

const DEFAULT_PREPROCESSING: TextPreprocessingConfig = {
  lowercase: true,
  removePunctuation: true,
  removeStopWords: true,
  normalizeNumbers: true,
  customReplacements: [
    { pattern: '有限公司', replacement: '' },
    { pattern: 'Limited', replacement: '' },
    { pattern: 'Ltd', replacement: '' },
    { pattern: '\\d{4}/\\d{2}', replacement: 'YEAR' },  // 年份格式
  ],
}

// ============ 中文停用词 ============
const CHINESE_STOP_WORDS = new Set([
  '的', '是', '在', '和', '与', '或', '及', '等', '之',
  '有', '无', '为', '以', '于', '从', '到', '至', '被',
  '这', '那', '该', '其', '此', '本', '上', '下', '中',
  '将', '可', '应', '需', '要', '能', '会', '已', '未',
])

// ============ 英文停用词 ============
const ENGLISH_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall',
  'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
  'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once',
])

// ============ 文本预处理 ============
function preprocessText(
  text: string,
  config: TextPreprocessingConfig = DEFAULT_PREPROCESSING
): string {
  let result = text

  // 自定义替换
  for (const { pattern, replacement } of config.customReplacements) {
    result = result.replace(new RegExp(pattern, 'gi'), replacement)
  }

  // 转小写
  if (config.lowercase) {
    result = result.toLowerCase()
  }

  // 移除标点
  if (config.removePunctuation) {
    result = result.replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
  }

  // 数字标准化
  if (config.normalizeNumbers) {
    result = result.replace(/\d+\.?\d*/g, 'NUM')
  }

  // 移除停用词
  if (config.removeStopWords) {
    const words = result.split(/\s+/)
    result = words
      .filter(word => !CHINESE_STOP_WORDS.has(word) && !ENGLISH_STOP_WORDS.has(word))
      .join(' ')
  }

  // 清理多余空格
  return result.replace(/\s+/g, ' ').trim()
}

// ============ 分词（简单版，按空格和中文字符） ============
function tokenize(text: string): string[] {
  const processed = preprocessText(text)
  const tokens: string[] = []

  // 分离中文和英文
  let current = ''
  let isChineseMode = false

  for (const char of processed) {
    const isChinese = /[\u4e00-\u9fff]/.test(char)

    if (isChinese !== isChineseMode && current) {
      if (current.trim()) {
        if (isChineseMode) {
          // 中文按字符分
          tokens.push(...current.trim().split(''))
        } else {
          // 英文按空格分
          tokens.push(...current.trim().split(/\s+/))
        }
      }
      current = ''
    }

    isChineseMode = isChinese
    current += char
  }

  // 处理剩余部分
  if (current.trim()) {
    if (isChineseMode) {
      tokens.push(...current.trim().split(''))
    } else {
      tokens.push(...current.trim().split(/\s+/))
    }
  }

  return tokens.filter(t => t.length > 0)
}

// ============ 计算词频向量 ============
function computeTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }

  return tf
}

// ============ 余弦相似度 ============
function cosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1)
  const tokens2 = tokenize(text2)

  if (tokens1.length === 0 || tokens2.length === 0) return 0

  const tf1 = computeTermFrequency(tokens1)
  const tf2 = computeTermFrequency(tokens2)

  // 获取所有词
  const allTerms = new Set([...tf1.keys(), ...tf2.keys()])

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (const term of allTerms) {
    const v1 = tf1.get(term) || 0
    const v2 = tf2.get(term) || 0

    dotProduct += v1 * v2
    norm1 += v1 * v1
    norm2 += v2 * v2
  }

  if (norm1 === 0 || norm2 === 0) return 0

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

// ============ Jaccard 相似度 ============
function jaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1))
  const tokens2 = new Set(tokenize(text2))

  if (tokens1.size === 0 && tokens2.size === 0) return 1
  if (tokens1.size === 0 || tokens2.size === 0) return 0

  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)))
  const union = new Set([...tokens1, ...tokens2])

  return intersection.size / union.size
}

// ============ Levenshtein 距离 ============
function levenshteinDistance(text1: string, text2: string): number {
  const s1 = preprocessText(text1)
  const s2 = preprocessText(text2)

  const m = s1.length
  const n = s2.length

  // 简化：如果字符串太长，截取前100字符
  const maxLen = 100
  const str1 = s1.slice(0, maxLen)
  const str2 = s2.slice(0, maxLen)

  const dp: number[][] = Array(str1.length + 1).fill(null).map(() =>
    Array(str2.length + 1).fill(0)
  )

  for (let i = 0; i <= str1.length; i++) dp[i][0] = i
  for (let j = 0; j <= str2.length; j++) dp[0][j] = j

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }

  return dp[str1.length][str2.length]
}

// ============ Levenshtein 相似度 ============
function levenshteinSimilarity(text1: string, text2: string): number {
  const dist = levenshteinDistance(text1, text2)
  const maxLen = Math.max(
    preprocessText(text1).length,
    preprocessText(text2).length
  )

  if (maxLen === 0) return 1
  return 1 - dist / maxLen
}

// ============ 混合相似度 ============
function hybridSimilarity(text1: string, text2: string): number {
  const cosine = cosineSimilarity(text1, text2)
  const jaccard = jaccardSimilarity(text1, text2)

  // 加权平均
  return 0.6 * cosine + 0.4 * jaccard
}

// ============ 选择相似度算法 ============
function computeSimilarity(
  text1: string,
  text2: string,
  algorithm: MatchAlgorithm = 'cosine'
): number {
  switch (algorithm) {
    case 'cosine':
      return cosineSimilarity(text1, text2)
    case 'jaccard':
      return jaccardSimilarity(text1, text2)
    case 'levenshtein':
      return levenshteinSimilarity(text1, text2)
    case 'hybrid':
      return hybridSimilarity(text1, text2)
    default:
      return cosineSimilarity(text1, text2)
  }
}

// ============ 匹配单个描述 ============
export function matchDescription(
  currentDescription: string,
  previousData: PreviousYearData[],
  config: MatchConfig = DEFAULT_CONFIG,
  algorithm: MatchAlgorithm = 'cosine'
): MatchResult {
  const candidates: MatchCandidate[] = []

  for (const prev of previousData) {
    const similarity = computeSimilarity(
      currentDescription,
      prev.description,
      algorithm
    )

    candidates.push({
      previousAccountId: prev.accountId,
      previousDescription: prev.description,
      previousValue: prev.value,
      previousYear: prev.year,
      similarity,
      matchedFields: getMatchedFields(currentDescription, prev.description),
    })
  }

  // 按相似度排序
  candidates.sort((a, b) => b.similarity - a.similarity)

  const bestMatch = candidates[0] || null

  // 判断是否需要人工复核
  let requiresManualReview = false
  let reviewReason: string | undefined

  if (bestMatch) {
    if (bestMatch.similarity < config.requireManualReviewBelow) {
      requiresManualReview = true
      reviewReason = `相似度 (${(bestMatch.similarity * 100).toFixed(1)}%) 低于阈值 (${(config.requireManualReviewBelow * 100)}%)`
    } else if (bestMatch.similarity < config.similarityThreshold.high) {
      if (bestMatch.similarity >= config.similarityThreshold.medium) {
        // 中等置信度，不一定需要人工复核
        reviewReason = `相似度中等 (${(bestMatch.similarity * 100).toFixed(1)}%)，建议复核`
      }
    }
  } else {
    requiresManualReview = true
    reviewReason = '未找到匹配的去年数据'
  }

  return {
    currentAccountId: '',  // 由调用者填充
    currentDescription,
    bestMatch,
    allCandidates: candidates.slice(0, 5),  // 返回前5个候选
    requiresManualReview,
    reviewReason,
  }
}

// ============ 批量匹配 ============
export function batchMatchDescriptions(
  currentData: { accountId: string; description: string }[],
  previousData: PreviousYearData[],
  config: MatchConfig = DEFAULT_CONFIG,
  algorithm: MatchAlgorithm = 'cosine'
): MatchResult[] {
  return currentData.map(item => {
    const result = matchDescription(
      item.description,
      previousData,
      config,
      algorithm
    )
    return {
      ...result,
      currentAccountId: item.accountId,
    }
  })
}

// ============ 获取匹配的字段 ============
function getMatchedFields(text1: string, text2: string): string[] {
  const tokens1 = new Set(tokenize(text1))
  const tokens2 = new Set(tokenize(text2))

  return [...tokens1].filter(t => tokens2.has(t))
}

// ============ 检测描述冲突 ============
export function detectDescriptionConflict(
  currentDescription: string,
  previousDescription: string,
  similarity: number
): {
  hasConflict: boolean
  conflictType?: 'category_mismatch' | 'year_mismatch' | 'value_drift' | 'semantic_drift'
  severity: 'low' | 'medium' | 'high'
  suggestion: string
} {
  // 高相似度但存在关键差异
  if (similarity > 0.7) {
    // 检测年份差异
    const currentYear = currentDescription.match(/\d{4}/)?.[0]
    const previousYear = previousDescription.match(/\d{4}/)?.[0]

    if (currentYear && previousYear && currentYear !== previousYear) {
      return {
        hasConflict: true,
        conflictType: 'year_mismatch',
        severity: 'low',
        suggestion: `年份已更新: ${previousYear} → ${currentYear}，确认是否需要调整描述`,
      }
    }

    return {
      hasConflict: false,
      severity: 'low',
      suggestion: '匹配良好',
    }
  }

  // 中等相似度
  if (similarity > 0.5) {
    return {
      hasConflict: true,
      conflictType: 'semantic_drift',
      severity: 'medium',
      suggestion: '描述存在语义漂移，建议人工确认分类',
    }
  }

  // 低相似度 - 可能是新业务
  return {
    hasConflict: true,
    conflictType: 'category_mismatch',
    severity: 'high',
    suggestion: '可能是新业务线，需要人工确认分类',
  }
}

// ============ 生成匹配报告 ============
export function generateMatchingReport(
  results: MatchResult[]
): {
  total: number
  highConfidence: number
  mediumConfidence: number
  lowConfidence: number
  requiresReview: number
  newBusiness: number
  averageSimilarity: number
} {
  const thresholds = DEFAULT_CONFIG.similarityThreshold

  let highConfidence = 0
  let mediumConfidence = 0
  let lowConfidence = 0
  let totalSimilarity = 0
  let requiresReview = 0
  let newBusiness = 0

  for (const result of results) {
    if (result.bestMatch) {
      const sim = result.bestMatch.similarity
      totalSimilarity += sim

      if (sim >= thresholds.high) {
        highConfidence++
      } else if (sim >= thresholds.medium) {
        mediumConfidence++
      } else {
        lowConfidence++
      }

      if (result.requiresManualReview) {
        requiresReview++
      }
    } else {
      newBusiness++
      lowConfidence++
    }
  }

  return {
    total: results.length,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    requiresReview,
    newBusiness,
    averageSimilarity: results.length > 0 ? totalSimilarity / results.length : 0,
  }
}
