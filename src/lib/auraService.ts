import type {
  AuraApiConfig,
  AuraAuthToken,
  AuraCompany,
  AuraTrialBalance,
  AuraTransaction,
  AuraAccount,
  AuraApiResponse,
  AuraConnectionStatus,
  AuraImportConfig,
  AuraImportResult,
  AuraDataSource,
  AuraImportError,
} from '@/types/aura'
import { logAudit } from './auditLog'

// ============ 默认配置 ============
const DEFAULT_CONFIG: Partial<AuraApiConfig> = {
  environment: 'sandbox',
  timeout: 30000,
  retryCount: 3,
}

// ============ 内存存储 ============
let currentConfig: AuraApiConfig | null = null
let currentToken: AuraAuthToken | null = null
let dataSources: AuraDataSource[] = []

// ============ Aura API 服务类 ============
class AuraApiService {
  private config: AuraApiConfig

  constructor(config: AuraApiConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    currentConfig = this.config
  }

  // ============ 连接测试 ============
  async testConnection(): Promise<AuraConnectionStatus> {
    try {
      // 模拟 API 调用
      const response = await this.makeRequest({
        endpoint: '/health',
        method: 'GET',
      })

      return {
        isConnected: response.success,
        lastConnected: new Date(),
        environment: this.config.environment,
        apiVersion: '2.1.0',
        rateLimitStatus: {
          limit: 1000,
          remaining: 995,
          resetAt: new Date(Date.now() + 3600000),
        },
      }
    } catch (error) {
      return {
        isConnected: false,
        environment: this.config.environment,
        error: error instanceof Error ? error.message : '连接失败',
      }
    }
  }

  // ============ 认证 ============
  async authenticate(apiKey: string, apiSecret?: string): Promise<AuraAuthToken> {
    // 模拟认证
    const token: AuraAuthToken = {
      accessToken: `aura-token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      tokenType: 'Bearer',
    }

    currentToken = token

    logAudit('FILE_UPLOAD', {
      action: 'Aura API 认证',
      reason: '成功获取访问令牌',
    })

    return token
  }

  // ============ 获取公司列表 ============
  async getCompanies(): Promise<AuraCompany[]> {
    // 模拟数据
    return [
      {
        id: 'company-001',
        type: 'company',
        code: 'ABC-HK',
        name: 'ABC 国际贸易有限公司',
        legalName: 'ABC International Trading Limited',
        registrationNumber: '12345678',
        taxId: '12345678-000',
        incorporationDate: new Date('2010-01-15'),
        fiscalYearEnd: '12-31',
        currency: 'HKD',
        country: 'Hong Kong',
        jurisdiction: 'HK',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'company-002',
        type: 'company',
        code: 'ABC-SG',
        name: 'ABC 新加坡私人有限公司',
        legalName: 'ABC Singapore Pte Ltd',
        registrationNumber: '201012345A',
        taxId: 'SG12345678X',
        incorporationDate: new Date('2015-06-20'),
        fiscalYearEnd: '12-31',
        currency: 'SGD',
        country: 'Singapore',
        jurisdiction: 'SG',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'company-003',
        type: 'company',
        code: 'ABC-JP',
        name: 'ABC 日本株式会社',
        legalName: 'ABC Japan K.K.',
        registrationNumber: '0123456789',
        taxId: 'JP1234567890',
        incorporationDate: new Date('2018-03-10'),
        fiscalYearEnd: '03-31',
        currency: 'JPY',
        country: 'Japan',
        jurisdiction: 'OTHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }

  // ============ 获取试算表 ============
  async getTrialBalance(
    companyId: string,
    fiscalYear: string,
    fiscalPeriod?: string
  ): Promise<AuraTrialBalance> {
    // 模拟 API 调用
    const company = (await this.getCompanies()).find(c => c.id === companyId)

    if (!company) {
      throw new Error(`Company ${companyId} not found`)
    }

    // 模拟试算表数据
    const entries = this.generateMockTrialBalanceEntries()

    return {
      id: `tb-${companyId}-${fiscalYear}`,
      companyId,
      companyName: company.name,
      fiscalYear,
      fiscalPeriod: fiscalPeriod || '12',
      asOfDate: new Date(`${fiscalYear.split('/')[0]}-12-31`),
      currency: company.currency,
      entries,
      totalDebit: entries.reduce((sum, e) => sum + e.debit, 0),
      totalCredit: entries.reduce((sum, e) => sum + e.credit, 0),
      isBalanced: true,
      sourceSystem: 'Aura',
      importedAt: new Date(),
    }
  }

  // ============ 获取科目列表 ============
  async getAccounts(companyId: string): Promise<AuraAccount[]> {
    // 模拟数据
    return this.generateMockAccounts()
  }

  // ============ 获取交易记录 ============
  async getTransactions(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AuraTransaction[]> {
    // 模拟数据
    return this.generateMockTransactions(companyId, 50)
  }

  // ============ 导入数据 ============
  async importData(config: AuraImportConfig): Promise<AuraImportResult> {
    const result: AuraImportResult = {
      id: `import-${Date.now()}`,
      config,
      status: 'in_progress',
      progress: 0,
      startTime: new Date(),
      recordsImported: 0,
      recordsFailed: 0,
      recordsTotal: 0,
    }

    try {
      // 模拟导入进度
      for (const dataType of config.dataTypes) {
        await this.simulateProgress(result, 20)

        let data: any
        switch (dataType) {
          case 'trial_balance':
            data = await this.getTrialBalance(config.companyId, config.fiscalYear)
            result.recordsTotal += data.entries.length
            break
          case 'chart_of_accounts':
            data = await this.getAccounts(config.companyId)
            result.recordsTotal += data.length
            break
          case 'company_info':
            const companies = await this.getCompanies()
            data = companies.find(c => c.id === config.companyId)
            result.recordsTotal += 1
            break
          default:
            result.warnings = result.warnings || []
            result.warnings.push(`数据类型 ${dataType} 暂不支持`)
        }

        await this.simulateProgress(result, 30)
        result.recordsImported = result.recordsTotal
      }

      result.status = 'completed'
      result.progress = 100
      result.endTime = new Date()

      logAudit('FILE_UPLOAD', {
        action: 'Aura 数据导入',
        config: JSON.stringify(config),
        recordsImported: result.recordsImported,
        reason: '数据导入完成',
      })

    } catch (error) {
      result.status = 'failed'
      result.endTime = new Date()
      result.errors = [{
        rowIndex: 0,
        error: error instanceof Error ? error.message : '导入失败',
        severity: 'error',
      }]
    }

    return result
  }

  // ============ 模拟进度更新 ============
  private async simulateProgress(result: AuraImportResult, increment: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        result.progress = Math.min(result.progress + increment, 100)
        resolve()
      }, 200)
    })
  }

  // ============ 发送 API 请求 ============
  private async makeRequest<T>(request: {
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    params?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }): Promise<AuraApiResponse<T>> {
    const startTime = Date.now()

    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

      // 模拟成功响应
      return {
        success: true,
        metadata: {
          requestId: `req-${Date.now()}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
          rateLimit: {
            remaining: 995,
            resetAt: new Date(Date.now() + 3600000),
          },
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : '请求失败',
          statusCode: 500,
          retryable: true,
        },
        metadata: {
          requestId: `req-${Date.now()}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      }
    }
  }

  // ============ 生成模拟科目数据 ============
  private generateMockAccounts(): AuraAccount[] {
    const accounts: AuraAccount[] = [
      { id: 'acc-001', type: 'account', accountType: 'asset', accountCode: '1001', accountName: '银行存款 - 港币', normalBalance: 'debit', isActive: true, code: '1001', name: '银行存款 - 港币', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-002', type: 'account', accountType: 'asset', accountCode: '1002', accountName: '银行存款 - 美元', normalBalance: 'debit', isActive: true, code: '1002', name: '银行存款 - 美元', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-003', type: 'account', accountType: 'asset', accountCode: '2101', accountName: '应收账款', normalBalance: 'debit', isActive: true, code: '2101', name: '应收账款', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-004', type: 'account', accountType: 'asset', accountCode: '3101', accountName: '存货', normalBalance: 'debit', isActive: true, code: '3101', name: '存货', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-005', type: 'account', accountType: 'asset', accountCode: '5101', accountName: '固定资产 - 机器设备', normalBalance: 'debit', isActive: true, code: '5101', name: '固定资产 - 机器设备', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-006', type: 'account', accountType: 'liability', accountCode: '7201', accountName: '应付账款', normalBalance: 'credit', isActive: true, code: '7201', name: '应付账款', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-007', type: 'account', accountType: 'expense', accountCode: '8101', accountName: '工资及薪金', normalBalance: 'debit', isActive: true, code: '8101', name: '工资及薪金', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-008', type: 'account', accountType: 'expense', accountCode: '8201', accountName: '租金支出', normalBalance: 'debit', isActive: true, code: '8201', name: '租金支出', createdAt: new Date(), updatedAt: new Date() },
      { id: 'acc-009', type: 'account', accountType: 'revenue', accountCode: '9001', accountName: '销售收入', normalBalance: 'credit', isActive: true, code: '9001', name: '销售收入', createdAt: new Date(), updatedAt: new Date() },
    ]
    return accounts
  }

  // ============ 生成模拟试算表分录 ============
  private generateMockTrialBalanceEntries() {
    return [
      { accountId: 'acc-001', accountCode: '1001', accountName: '银行存款 - 港币', accountType: 'asset' as const, openingBalance: 10000000, debit: 5800000, credit: 3200000, closingBalance: 12600000, taxBalance: 12600000 },
      { accountId: 'acc-002', accountCode: '1002', accountName: '银行存款 - 美元', accountType: 'asset' as const, openingBalance: 6000000, debit: 4240000, credit: 2000000, closingBalance: 8240000, taxBalance: 8240000 },
      { accountId: 'acc-003', accountCode: '2101', accountName: '应收账款', accountType: 'asset' as const, openingBalance: 4500000, debit: 2180000, credit: 1000000, closingBalance: 5680000, taxBalance: 5420000, taxAdjustments: -260000 },
      { accountId: 'acc-004', accountCode: '3101', accountName: '存货', accountType: 'asset' as const, openingBalance: 2800000, debit: 1400000, credit: 1000000, closingBalance: 3200000, taxBalance: 3200000 },
      { accountId: 'acc-005', accountCode: '5101', accountName: '固定资产 - 机器设备', accountType: 'asset' as const, openingBalance: 14000000, debit: 3800000, credit: 2000000, closingBalance: 15800000, taxBalance: 14200000, taxAdjustments: -1600000 },
      { accountId: 'acc-006', accountCode: '7201', accountName: '应付账款', accountType: 'liability' as const, openingBalance: -3500000, debit: 1200000, credit: 1700000, closingBalance: -4200000, taxBalance: -4200000 },
      { accountId: 'acc-007', accountCode: '8101', accountName: '工资及薪金', accountType: 'expense' as const, openingBalance: 0, debit: 8500000, credit: 0, closingBalance: 8500000, taxBalance: 8500000 },
      { accountId: 'acc-008', accountCode: '8201', accountName: '租金支出', accountType: 'expense' as const, openingBalance: 0, debit: 2400000, credit: 0, closingBalance: 2400000, taxBalance: 2400000 },
      { accountId: 'acc-009', accountCode: '9001', accountName: '销售收入', accountType: 'revenue' as const, openingBalance: 0, debit: 0, credit: 12500000, closingBalance: -12500000, taxBalance: -12500000 },
    ]
  }

  // ============ 生成模拟交易数据 ============
  private generateMockTransactions(companyId: string, count: number): AuraTransaction[] {
    const transactions: AuraTransaction[] = []
    const baseDate = new Date()

    for (let i = 0; i < count; i++) {
      const date = new Date(baseDate.getTime() - i * 86400000 * Math.random() * 30)
      transactions.push({
        id: `txn-${companyId}-${i}`,
        type: 'transaction',
        code: `TXN${String(i).padStart(6, '0')}`,
        name: `交易 #${i + 1}`,
        transactionId: `TXN${String(i).padStart(6, '0')}`,
        transactionDate: date,
        postingDate: date,
        fiscalPeriod: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        accountId: `acc-${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}`,
        accountCode: `${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        accountName: '模拟科目',
        debit: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) : undefined,
        credit: Math.random() > 0.5 ? Math.floor(Math.random() * 100000) : undefined,
        balance: Math.floor(Math.random() * 1000000),
        currency: 'HKD',
        description: `交易描述 #${i + 1}`,
        createdAt: date,
        updatedAt: date,
      })
    }

    return transactions
  }
}

// ============ 导出单例和工具函数 ============
export function createAuraService(config: AuraApiConfig): AuraApiService {
  return new AuraApiService(config)
}

export function getCurrentConfig(): AuraApiConfig | null {
  return currentConfig
}

export function getCurrentToken(): AuraAuthToken | null {
  return currentToken
}

export function getDataSources(): AuraDataSource[] {
  return dataSources
}

export function addDataSource(source: AuraDataSource): void {
  dataSources.push(source)
}

export function removeDataSource(sourceId: string): void {
  dataSources = dataSources.filter(s => s.id !== sourceId)
}

// ============ 预设的数据源模板 ============
export const AURA_SOURCE_TEMPLATES: Partial<AuraDataSource>[] = [
  {
    name: 'Aura 生产环境',
    type: 'aura',
    config: {
      baseUrl: 'https://api.aura-accounting.com/v2',
      environment: 'production',
      timeout: 30000,
    },
  },
  {
    name: 'Aura 沙盒环境',
    type: 'aura',
    config: {
      baseUrl: 'https://sandbox.api.aura-accounting.com/v2',
      environment: 'sandbox',
      timeout: 30000,
    },
  },
]
