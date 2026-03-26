// ============ 文件上传相关类型 ============
export type FileType = 'excel' | 'csv' | 'pdf' | 'tb-template'

export type FileStatus = 'uploading' | 'parsing' | 'mapping' | 'validating' | 'year-replacement' | 'completed' | 'error'

export interface ParsedFile {
  id: string
  name: string
  type: FileType
  size: string
  status: FileStatus
  progress: number
  issues?: number
  records?: number
  rawData?: any[]
  parsedData?: ParsedRow[]
  yearInfo?: YearInfo
  validationResults?: ValidationIssue[]
  createdAt: Date
}

// ============ 解析数据相关类型 ============
export interface ParsedRow {
  id: number | string
  accountCode: string
  accountName: string
  bookValue: string
  taxValue: string
  status: 'matched' | 'adjusted' | 'warning' | 'new-account'
  confidence: number
  yearInfo?: YearInfo
  source: 'current' | 'previous'
  currentYear?: number
  previousYear?: number
}

// ============ 年份信息相关类型 ============
export interface YearInfo {
  sourceYear: string           // 原始年份 (如 "2023/24")
  targetYear: string           // 目标年份 (如 "2024/25")
  fiscalYearType: 'HK' | 'SG' | 'CN' | 'US' | 'OTHER'
  replacementType: 'auto' | 'manual' | 'none'
  confidence: number
  detected?: boolean           // 是否已检测到年份信息
  previousYear?: number        // 上年年份（兼容字段）
  currentYear?: number         // 本年年份（兼容字段）
}

export interface YearReplacementRule {
  pattern: RegExp
  replacement: string
  description: string
}

// ============ 校验相关类型 ============
export interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  field: string
  message: string
  suggestion?: string
  requiresManualReview: boolean
  relatedAccountId?: string
}

// ============ 新业务线提示 ============
export interface NewBusinessAlert {
  id: string
  accountCode: string
  accountName: string
  reason: string
  suggestedCategory?: string
  status: 'pending' | 'confirmed' | 'ignored'
}

// ============ 操作留痕相关类型 ============
export type AuditAction =
  | 'FILE_UPLOAD'
  | 'FILE_PARSE'
  | 'YEAR_REPLACE'
  | 'AI_SUGGEST'
  | 'USER_OVERRIDE'
  | 'MANUAL_INPUT'
  | 'VALIDATION'
  | 'EXPORT'

export interface AuditLog {
  id: string
  timestamp: Date
  action: AuditAction
  userId?: string
  userName?: string
  details: {
    field?: string
    oldValue?: any
    newValue?: any
    aiValue?: any
    reason?: string
    fileId?: string
    fileName?: string
    [key: string]: any
  }
}

// ============ 科目映射相关类型 ============
export interface AccountMapping {
  id: string
  sourceAccount: string
  sourceName: string
  targetTaxCategory: string
  targetTaxCode?: string
  mappingType: 'exact' | 'partial' | 'manual'
  confidence: number
  adjustmentRequired: boolean
  adjustmentReason?: string
}

// ============ 文件解析配置 ============
export interface ParseConfig {
  // Excel 配置
  sheetName?: string
  headerRow?: number
  dataStartRow?: number

  // 列映射
  columnMapping: {
    accountCode?: number
    accountName?: number
    bookValue?: number
    taxValue?: number
    [key: string]: number | undefined
  }

  // 年份配置
  yearDetection: {
    enabled: boolean
    patterns: string[]
    targetYear: string
  }
}
