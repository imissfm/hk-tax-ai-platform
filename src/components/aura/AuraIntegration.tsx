import { useState, useEffect } from 'react'
import {
  Cloud,
  Link2,
  Unlink2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Building2,
  Calendar,
  FileSpreadsheet,
  Database,
  Settings,
  Loader2,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  createAuraService,
  getDataSources,
  addDataSource,
  AURA_SOURCE_TEMPLATES,
} from '@/lib/auraService'
import type {
  AuraApiConfig,
  AuraConnectionStatus,
  AuraCompany,
  AuraDataSource,
  AuraImportConfig,
  AuraImportResult,
  AuraDataType,
} from '@/types/aura'

interface AuraIntegrationProps {
  onImportComplete?: (result: AuraImportResult) => void
}

export function AuraIntegration({ onImportComplete }: AuraIntegrationProps) {
  const [config, setConfig] = useState<Partial<AuraApiConfig>>({
    environment: 'sandbox',
    baseUrl: 'https://sandbox.api.aura-accounting.com/v2',
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<AuraConnectionStatus | null>(null)
  const [companies, setCompanies] = useState<AuraCompany[]>([])
  const [selectedCompany, setSelectedCompany] = useState<AuraCompany | null>(null)
  const [fiscalYear, setFiscalYear] = useState('2024/25')
  const [selectedDataTypes, setSelectedDataTypes] = useState<AuraDataType[]>(['trial_balance'])
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<AuraImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  // 数据类型配置
  const dataTypeOptions: { value: AuraDataType; label: string; icon: typeof FileSpreadsheet }[] = [
    { value: 'company_info', label: '公司信息', icon: Building2 },
    { value: 'chart_of_accounts', label: '科目表', icon: FileSpreadsheet },
    { value: 'trial_balance', label: '试算表', icon: Database },
    { value: 'general_ledger', label: '总账', icon: FileSpreadsheet },
    { value: 'journal_entries', label: '凭证', icon: FileSpreadsheet },
    { value: 'tax_records', label: '税务记录', icon: Database },
  ]

  // 测试连接
  const handleTestConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus(null)

    try {
      const service = createAuraService(config as AuraApiConfig)
      const status = await service.testConnection()
      setConnectionStatus(status)

      if (status.isConnected) {
        // 获取公司列表
        const companyList = await service.getCompanies()
        setCompanies(companyList)
      }
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        environment: config.environment || 'sandbox',
        error: error instanceof Error ? error.message : '连接失败',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 开始导入
  const handleStartImport = async () => {
    if (!selectedCompany || selectedDataTypes.length === 0) {
      alert('请选择公司和数据类型')
      return
    }

    setIsImporting(true)
    setImportResult(null)
    setImportProgress(0)

    try {
      const service = createAuraService(config as AuraApiConfig)

      const importConfig: AuraImportConfig = {
        sourceId: 'aura-main',
        sourceName: 'Aura',
        companyId: selectedCompany.id,
        fiscalYear,
        dataTypes: selectedDataTypes,
      }

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const result = await service.importData(importConfig)

      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResult(result)

      if (result.status === 'completed') {
        onImportComplete?.(result)
      }
    } catch (error) {
      setImportResult({
        id: `import-error-${Date.now()}`,
        config: {} as AuraImportConfig,
        status: 'failed',
        progress: 0,
        startTime: new Date(),
        recordsImported: 0,
        recordsFailed: 0,
        recordsTotal: 0,
        errors: [{
          rowIndex: 0,
          error: error instanceof Error ? error.message : '导入失败',
          severity: 'error',
        }],
      })
    } finally {
      setIsImporting(false)
    }
  }

  // 获取状态图标
  const getStatusIcon = () => {
    if (!connectionStatus) return <Unlink2 className="w-5 h-5 text-muted-foreground" />
    if (connectionStatus.isConnected) return <Link2 className="w-5 h-5 text-success" />
    return <Unlink2 className="w-5 h-5 text-destructive" />
  }

  return (
    <div className="space-y-6">
      {/* 连接配置 */}
      <Card hover>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Aura API 连接配置
          </CardTitle>
          <CardDescription>
            配置 Aura API 连接以导入财务数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 环境选择 */}
          <div className="grid grid-cols-3 gap-4">
            {(['production', 'sandbox', 'development'] as const).map((env) => (
              <button
                key={env}
                onClick={() => {
                  setConfig(prev => ({ ...prev, environment: env }))
                  setConnectionStatus(null)
                }}
                className={cn(
                  'p-4 rounded-lg border text-center transition-all',
                  config.environment === env
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <p className="font-medium">{env === 'production' ? '生产环境' : env === 'sandbox' ? '沙盒环境' : '开发环境'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {env === 'production' ? '正式数据' : env === 'sandbox' ? '测试数据' : '本地开发'}
                </p>
              </button>
            ))}
          </div>

          {/* API 配置 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">API Base URL</label>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.aura-accounting.com/v2"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="输入 API Key"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          {/* 连接按钮和状态 */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleTestConnection}
              disabled={isConnecting || !config.baseUrl || !config.apiKey}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                getStatusIcon()
              )}
              {isConnecting ? '连接中...' : connectionStatus?.isConnected ? '重新连接' : '测试连接'}
            </Button>

            {connectionStatus && (
              <div className="flex items-center gap-3">
                {connectionStatus.isConnected ? (
                  <>
                    <Badge variant="success">已连接</Badge>
                    <span className="text-xs text-muted-foreground">
                      API v{connectionStatus.apiVersion}
                    </span>
                  </>
                ) : (
                  <Badge variant="destructive">连接失败</Badge>
                )}
              </div>
            )}
          </div>

          {/* 连接错误 */}
          {connectionStatus?.error && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">连接错误</p>
                  <p className="text-sm text-muted-foreground">{connectionStatus.error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 公司选择和数据导入 - 仅在连接成功后显示 */}
      {connectionStatus?.isConnected && (
        <>
          {/* 公司选择 */}
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                选择公司
              </CardTitle>
              <CardDescription>
                从 Aura 中选择要导入数据的公司
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all',
                      selectedCompany?.id === company.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{company.legalName}</p>
                      </div>
                      {company.jurisdiction === 'HK' && (
                        <Badge variant="secondary" className="text-xs">香港</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>注册号: {company.registrationNumber}</span>
                      <span>币种: {company.currency}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 导入配置 */}
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                数据导入配置
              </CardTitle>
              <CardDescription>
                选择要导入的数据类型和时间范围
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 财年选择 */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  财政年度
                </label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="2024/25"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              {/* 数据类型选择 */}
              <div>
                <label className="text-sm font-medium mb-2 block">数据类型</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dataTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedDataTypes(prev =>
                          prev.includes(option.value)
                            ? prev.filter(t => t !== option.value)
                            : [...prev, option.value]
                        )
                      }}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all flex items-center gap-3',
                        selectedDataTypes.includes(option.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <option.icon className={cn(
                        'w-5 h-5',
                        selectedDataTypes.includes(option.value) ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 导入按钮 */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  已选择 {selectedDataTypes.length} 种数据类型
                </div>
                <Button
                  onClick={handleStartImport}
                  disabled={isImporting || !selectedCompany || selectedDataTypes.length === 0}
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isImporting ? '导入中...' : '开始导入'}
                </Button>
              </div>

              {/* 导入进度 */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">导入进度</span>
                    <span className="font-medium">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {/* 导入结果 */}
              {importResult && (
                <div className={cn(
                  'p-4 rounded-lg',
                  importResult.status === 'completed' ? 'bg-success/5 border border-success/20' :
                  importResult.status === 'failed' ? 'bg-destructive/5 border border-destructive/20' :
                  'bg-warning/5 border border-warning/20'
                )}>
                  <div className="flex items-start gap-3">
                    {importResult.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : importResult.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {importResult.status === 'completed' ? '导入完成' :
                         importResult.status === 'failed' ? '导入失败' : '部分导入'}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">总计:</span>
                          <span className="font-medium ml-1">{importResult.recordsTotal}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">成功:</span>
                          <span className="font-medium ml-1 text-success">{importResult.recordsImported}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">失败:</span>
                          <span className="font-medium ml-1 text-destructive">{importResult.recordsFailed}</span>
                        </div>
                      </div>

                      {/* 错误列表 */}
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {importResult.errors.slice(0, 3).map((error, i) => (
                            <p key={i} className="text-xs text-destructive">
                              行 {error.rowIndex}: {error.error}
                            </p>
                          ))}
                          {importResult.errors.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              还有 {importResult.errors.length - 3} 个错误...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 已配置的数据源 */}
      <Card hover>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            数据源管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getDataSources().length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无已配置的数据源</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getDataSources().map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.config.environment} · 上次同步: {source.lastSync?.toLocaleString('zh-CN') || '从未'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.connectionStatus.isConnected ? 'success' : 'destructive'}>
                      {source.connectionStatus.isConnected ? '已连接' : '未连接'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
