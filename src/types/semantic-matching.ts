// ============ 语义匹配相关类型 ============

export interface MatchCandidate {
  id?: string
  currentDescription?: string
  previousDescription: string
  similarity: number
  matchType?: 'exact' | 'high' | 'medium' | 'low' | 'none'
  previousYear: string
  previousAccountId?: string
  previousValue?: number
  matchedFields?: string[]
}

export interface MatchResult {
  currentAccountId: string
  currentDescription: string
  bestMatch: MatchCandidate | null
  allCandidates: MatchCandidate[]
  requiresManualReview: boolean
  reviewReason?: string
}

export interface PreviousYearData {
  accountId: string
  description: string
  year: string
  value?: number
  category?: string
  taxCode?: string
}

export interface MatchConfig {
  similarityThreshold: {
    high: number      // >= 0.9
    medium: number    // >= 0.7
    low: number       // >= 0.5
  }
  requireManualReviewBelow: number  // < 0.7
  maxCandidates: number
}

export interface ConflictInfo {
  type: 'duplicate_match' | 'category_mismatch' | 'value_discrepancy' | 'new_business'
  currentAccountId: string
  conflictingAccounts: string[]
  description: string
  severity: 'error' | 'warning' | 'info'
  suggestedResolution?: string
}

// ============ 匹配算法类型 ============
export type MatchAlgorithm = 'cosine' | 'jaccard' | 'levenshtein' | 'hybrid'

export interface TextPreprocessingConfig {
  lowercase: boolean
  removePunctuation: boolean
  removeStopWords: boolean
  normalizeNumbers: boolean
  customReplacements: { pattern: string; replacement: string }[]
}
