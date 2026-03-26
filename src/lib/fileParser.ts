import * as XLSX from 'xlsx'
import type {
  ParsedRow,
  YearInfo,
  YearReplacementRule,
  ValidationIssue,
  NewBusinessAlert,
  ParseConfig,
} from '@/types/file-upload'

// ============ 年份替换规则 ============
const yearReplacementRules: YearReplacementRule[] = [
  {
    pattern: /FY(\d{4})/gi,
    replacement: 'FY{nextYear}',
    description: '财政年度格式 FY2024 → FY2025'
  },
  {
    pattern: /(\d{4})\/(\d{2})/g,
    replacement: '{nextYearShort}/{nextTwoDigit}',
    description: '香港格式 2023/24 → 2024/25'
  },
  {
    pattern: /(\d{4})年/g,
    replacement: '{nextYear}年',
    description: '中文格式 2024年 → 2025年'
  },
  {
    pattern: /FY(\d{2})/gi,
    replacement: 'FY{nextTwoDigit}',
    description: '短格式 FY24 → FY25'
  },
]

// ============ 文件类型检测 ============
export function detectFileType(file: File): 'excel' | 'csv' | 'pdf' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type

  if (extension === 'xlsx' || extension === 'xls' || mimeType.includes('spreadsheet')) {
    return 'excel'
  }
  if (extension === 'csv' || mimeType === 'text/csv') {
    return 'csv'
  }
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf'
  }
  return 'unknown'
}

// ============ Excel 文件解析 ============
export async function parseExcelFile(
  file: File,
  config?: Partial<ParseConfig>
): Promise<{ data: ParsedRow[]; yearInfo?: YearInfo; issues: ValidationIssue[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // 获取第一个工作表或指定的工作表
        const sheetName = config?.sheetName || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        if (!worksheet) {
          reject(new Error(`工作表 "${sheetName}" 不存在`))
          return
        }

        // 转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: '',
        }) as string[][]

        // 解析数据
        const result = parseRawData(jsonData, file.name, config)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// ============ CSV 文件解析 ============
export async function parseCsvFile(
  file: File,
  config?: Partial<ParseConfig>
): Promise<{ data: ParsedRow[]; yearInfo?: YearInfo; issues: ValidationIssue[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).map(line =>
          line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        )

        const result = parseRawData(lines, file.name, config)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// ============ 原始数据解析 ============
function parseRawData(
  rawData: string[][],
  fileName: string,
  config?: Partial<ParseConfig>
): { data: ParsedRow[]; yearInfo?: YearInfo; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = []
  const parsedRows: ParsedRow[] = []

  // 检测表头行
  const headerRowIndex = detectHeaderRow(rawData)
  const headers = rawData[headerRowIndex] || []

  // 检测列映射
  const columnMapping = config?.columnMapping || detectColumnMapping(headers)

  // 检测年份信息
  const yearInfo = detectYearInfo(rawData, fileName)
  if (yearInfo) {
    issues.push({
      id: `year-${Date.now()}`,
      type: 'info',
      field: 'year',
      message: `检测到年份 ${yearInfo.sourceYear}，将替换为 ${yearInfo.targetYear}`,
      suggestion: '请确认年份替换是否正确',
      requiresManualReview: yearInfo.confidence < 0.9,
    })
  }

  // 解析数据行
  const dataStartRow = config?.dataStartRow || headerRowIndex + 1
  for (let i = dataStartRow; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || row.every(cell => !cell)) continue // 跳过空行

    const parsedRow = parseRow(row, columnMapping, i, yearInfo)
    if (parsedRow) {
      parsedRows.push(parsedRow)

      // 检测新业务线
      if (isNewBusinessLine(parsedRow)) {
        issues.push({
          id: `new-business-${i}`,
          type: 'warning',
          field: `account-${parsedRow.accountCode}`,
          message: `新业务线: ${parsedRow.accountName} 在去年数据中无参照`,
          suggestion: '需要人工确认业务分类',
          requiresManualReview: true,
          relatedAccountId: parsedRow.accountCode,
        })
      }
    }
  }

  return { data: parsedRows, yearInfo, issues }
}

// ============ 表头行检测 ============
function detectHeaderRow(data: string[][]): number {
  const headerKeywords = ['科目', 'account', 'code', '名称', 'name', '金额', 'amount', 'value', '借', '贷', 'debit', 'credit']

  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    const lowerRow = row.map(cell => cell.toLowerCase()).join(' ')
    const matchCount = headerKeywords.filter(kw => lowerRow.includes(kw)).length

    if (matchCount >= 2) {
      return i
    }
  }

  return 0
}

// ============ 列映射检测 ============
function detectColumnMapping(headers: string[]): ParseConfig['columnMapping'] {
  const mapping: ParseConfig['columnMapping'] = {}

  headers.forEach((header, index) => {
    const h = header.toLowerCase()

    if (h.includes('科目代码') || h.includes('科目编号') || h === 'code' || h === 'account code') {
      mapping.accountCode = index
    } else if (h.includes('科目名称') || h === 'name' || h === 'account name') {
      mapping.accountName = index
    } else if (h.includes('账面') || h.includes('book') || h.includes('账套')) {
      mapping.bookValue = index
    } else if (h.includes('税务') || h.includes('tax')) {
      mapping.taxValue = index
    }
  })

  return mapping
}

// ============ 年份信息检测 ============
function detectYearInfo(data: string[][], fileName: string): YearInfo | undefined {
  // 从文件名检测
  const fileNameYear = extractYearFromString(fileName)

  // 从数据内容检测
  const dataContent = data.flat().join(' ')
  const contentYear = extractYearFromString(dataContent)

  const sourceYear = fileNameYear || contentYear
  if (!sourceYear) return undefined

  // 计算目标年份
  const targetYear = calculateTargetYear(sourceYear)

  return {
    sourceYear,
    targetYear,
    fiscalYearType: detectFiscalYearType(sourceYear),
    replacementType: 'auto',
    confidence: fileNameYear ? 0.95 : 0.85,
  }
}

// ============ 从字符串提取年份 ============
function extractYearFromString(str: string): string | undefined {
  // 匹配各种年份格式
  const patterns = [
    /FY(\d{2,4})/i,           // FY24, FY2024
    /(\d{4})\/(\d{2})/,       // 2023/24
    /(\d{4})年/,              // 2024年
    /(\d{4})/,                // 2024
  ]

  for (const pattern of patterns) {
    const match = str.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return undefined
}

// ============ 计算目标年份 ============
function calculateTargetYear(sourceYear: string): string {
  // 处理 2023/24 格式
  const hkMatch = sourceYear.match(/(\d{4})\/(\d{2})/)
  if (hkMatch) {
    const year = parseInt(hkMatch[1])
    return `${year + 1}/${(year + 2) % 100}`
  }

  // 处理 FY2024 格式
  const fyMatch = sourceYear.match(/FY(\d{2,4})/i)
  if (fyMatch) {
    const year = parseInt(fyMatch[1])
    if (fyMatch[1].length === 2) {
      return `FY${(year + 1) % 100}`
    }
    return `FY${year + 1}`
  }

  // 处理纯数字年份
  const numMatch = sourceYear.match(/(\d{4})/)
  if (numMatch) {
    const year = parseInt(numMatch[1])
    return `${year + 1}`
  }

  return sourceYear
}

// ============ 检测会计年度类型 ============
function detectFiscalYearType(yearStr: string): YearInfo['fiscalYearType'] {
  if (yearStr.includes('/')) return 'HK'
  if (yearStr.toLowerCase().includes('fy')) return 'SG'
  if (yearStr.includes('年')) return 'CN'
  return 'OTHER'
}

// ============ 解析单行数据 ============
function parseRow(
  row: string[],
  columnMapping: ParseConfig['columnMapping'],
  rowIndex: number,
  yearInfo?: YearInfo
): ParsedRow | null {
  const codeIdx = columnMapping.accountCode ?? 0
  const nameIdx = columnMapping.accountName ?? 1
  const bookIdx = columnMapping.bookValue ?? 2
  const taxIdx = columnMapping.taxValue ?? 3

  const accountCode = row[codeIdx]?.toString().trim()
  const accountName = row[nameIdx]?.toString().trim()

  if (!accountCode || !accountName) return null

  // 应用年份替换
  let processedName = accountName
  if (yearInfo && yearInfo.replacementType !== 'none') {
    processedName = applyYearReplacement(accountName, yearInfo)
  }

  return {
    id: rowIndex,
    accountCode,
    accountName: processedName,
    bookValue: row[bookIdx]?.toString().trim() || '0',
    taxValue: row[taxIdx]?.toString().trim() || row[bookIdx]?.toString().trim() || '0',
    status: 'matched',
    confidence: 85,
    yearInfo,
    source: 'current',
  }
}

// ============ 应用年份替换 ============
function applyYearReplacement(text: string, yearInfo: YearInfo): string {
  let result = text

  yearReplacementRules.forEach(rule => {
    if (rule.pattern.test(result)) {
      result = result.replace(rule.pattern, yearInfo.targetYear)
    }
  })

  return result
}

// ============ 新业务线检测 ============
function isNewBusinessLine(row: ParsedRow): boolean {
  // 检测常见的新业务线关键词
  const newBusinessKeywords = [
    '新业务', 'new business', '新增', '试点',
    '首年', 'first year', '初始', 'initial',
  ]

  const nameLower = row.accountName.toLowerCase()
  return newBusinessKeywords.some(kw => nameLower.includes(kw))
}

// ============ 格式化文件大小 ============
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============ 生成唯一 ID ============
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
