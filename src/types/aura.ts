// ============ Aura API 配置 ============
export interface AuraApiConfig {
  baseUrl: string
  apiKey?: string
  apiSecret?: string
  tenantId?: string
  environment: 'production' | 'sandbox' | 'development'
  timeout?: number  // milliseconds
  retryCount?: number
}

// ============ Aura 认证相关 ============
export interface AuraAuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  tokenType: 'Bearer' | 'ApiKey'
}

export interface AuraAuthRequest {
  grantType: 'client_credentials' | 'password' | 'api_key'
  clientId?: string
  clientSecret?: string
  apiKey?: string
  scope?: string[]
}

// ============ Aura 数据实体 ============
export interface AuraEntity {
  id: string
  type: AuraEntityType
  code: string
  name: string
  description?: string
  parentId?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type AuraEntityType =
  | 'company'           // 公司
  | 'subsidiary'        // 子公司
  | 'branch'            // 分支机构
  | 'department'        // 部门
  | 'account'           // 科目
  | 'transaction'       // 交易
  | 'journal_entry'     // 凭证
  | 'tax_record'        // 税务记录

// ============ Aura 科目信息 ============
export interface AuraAccount extends AuraEntity {
  type: 'account'
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  accountCode: string
  accountName: string
  normalBalance: 'debit' | 'credit'
  taxCategory?: string
  taxCode?: string
  openingBalance?: number
  currency?: string
  isActive: boolean
  parentAccountId?: string
}

// ============ Aura 交易记录 ============
export interface AuraTransaction extends AuraEntity {
  type: 'transaction'
  transactionId: string
  transactionDate: Date
  postingDate: Date
  fiscalPeriod: string
  accountId: string
  accountCode: string
  accountName: string
  debit?: number
  credit?: number
  balance: number
  currency: string
  description: string
  reference?: string
  sourceSystem?: string
  sourceDocumentId?: string
}

// ============ Aura 试算表 ============
export interface AuraTrialBalance {
  id: string
  companyId: string
  companyName: string
  fiscalYear: string
  fiscalPeriod: string
  asOfDate: Date
  currency: string
  entries: AuraTrialBalanceEntry[]
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  sourceSystem: string
  importedAt: Date
}

export interface AuraTrialBalanceEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  openingBalance: number
  debit: number
  credit: number
  closingBalance: number
  taxAdjustments?: number
  taxBalance?: number
}

// ============ Aura 公司信息 ============
export interface AuraCompany extends AuraEntity {
  type: 'company'
  companyCode: string
  companyName: string
  legalName: string
  registrationNumber: string
  taxId?: string
  incorporationDate?: Date
  fiscalYearEnd?: string
  currency: string
  country: string
  jurisdiction: 'HK' | 'SG' | 'CN' | 'US' | 'OTHER'
  subsidiaries?: AuraCompany[]
}

// ============ Aura API 请求/响应 ============
export interface AuraApiRequest<T = any> {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, string | number | boolean>
  body?: T
  headers?: Record<string, string>
}

export interface AuraApiResponse<T = any> {
  success: boolean
  data?: T
  error?: AuraApiError
  metadata?: {
    requestId: string
    timestamp: Date
    duration: number  // ms
    rateLimit?: {
      remaining: number
      resetAt: Date
    }
  }
}

export interface AuraApiError {
  code: string
  message: string
  details?: string
  statusCode: number
  retryable: boolean
}

// ============ Aura 数据导入配置 ============
export interface AuraImportConfig {
  sourceId: string
  sourceName: string
  companyId: string
  fiscalYear: string
  fiscalPeriod?: string
  dataTypes: AuraDataType[]
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  filters?: Record<string, any>
  mappings?: AuraFieldMapping[]
}

export type AuraDataType =
  | 'trial_balance'
  | 'general_ledger'
  | 'chart_of_accounts'
  | 'journal_entries'
  | 'tax_records'
  | 'company_info'

export interface AuraFieldMapping {
  sourceField: string
  targetField: string
  transform?: 'uppercase' | 'lowercase' | 'number' | 'date' | 'custom'
  customTransform?: string
}

// ============ Aura 数据导入结果 ============
export interface AuraImportResult {
  id: string
  config: AuraImportConfig
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial'
  progress: number
  startTime: Date
  endTime?: Date
  recordsImported: number
  recordsFailed: number
  recordsTotal: number
  errors?: AuraImportError[]
  warnings?: string[]
  data?: any
}

export interface AuraImportError {
  rowIndex: number
  field?: string
  value?: any
  error: string
  severity: 'error' | 'warning'
}

// ============ Aura 连接状态 ============
export interface AuraConnectionStatus {
  isConnected: boolean
  lastConnected?: Date
  environment: 'production' | 'sandbox' | 'development'
  apiVersion?: string
  rateLimitStatus?: {
    limit: number
    remaining: number
    resetAt: Date
  }
  error?: string
}

// ============ Aura 数据源配置 ============
export interface AuraDataSource {
  id: string
  name: string
  type: 'aura' | 'erp' | 'accounting' | 'spreadsheet'
  config: AuraApiConfig
  connectionStatus: AuraConnectionStatus
  lastSync?: Date
  syncInterval?: number  // hours
  isActive: boolean
  mappings: AuraFieldMapping[]
}
