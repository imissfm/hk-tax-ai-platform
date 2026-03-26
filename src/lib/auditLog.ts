import type { AuditLog, AuditAction } from '@/types/file-upload'

// ============ 内存存储（生产环境应使用数据库） ============
let auditLogs: AuditLog[] = []

// ============ 生成唯一 ID ============
function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============ 记录操作日志 ============
export function logAudit(
  action: AuditAction,
  details: AuditLog['details'],
  userId?: string,
  userName?: string
): AuditLog {
  const log: AuditLog = {
    id: generateAuditId(),
    timestamp: new Date(),
    action,
    userId,
    userName,
    details,
  }

  auditLogs.push(log)
  return log
}

// ============ 获取所有日志 ============
export function getAllAuditLogs(): AuditLog[] {
  return [...auditLogs].sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  )
}

// ============ 获取指定文件相关的日志 ============
export function getAuditLogsByFileId(fileId: string): AuditLog[] {
  return auditLogs.filter(log => log.details.fileId === fileId)
}

// ============ 获取指定操作类型的日志 ============
export function getAuditLogsByAction(action: AuditAction): AuditLog[] {
  return auditLogs.filter(log => log.action === action)
}

// ============ 记录文件上传 ============
export function logFileUpload(
  fileName: string,
  fileId: string,
  fileSize: string,
  fileType: string
): AuditLog {
  return logAudit('FILE_UPLOAD', {
    fileId,
    fileName,
    fileSize,
    fileType,
    reason: '用户上传文件',
  })
}

// ============ 记录 AI 建议被采用 ============
export function logAiSuggestion(
  field: string,
  aiValue: any,
  adopted: boolean,
  fileId?: string
): AuditLog {
  return logAudit('AI_SUGGEST', {
    field,
    aiValue,
    newValue: adopted ? aiValue : undefined,
    reason: adopted ? 'AI 建议被采用' : 'AI 建议被拒绝',
    fileId,
  })
}

// ============ 记录用户覆盖 AI 建议 ============
export function logUserOverride(
  field: string,
  aiValue: any,
  userValue: any,
  reason: string,
  fileId?: string,
  userId?: string,
  userName?: string
): AuditLog {
  return logAudit('USER_OVERRIDE', {
    field,
    oldValue: aiValue,
    newValue: userValue,
    aiValue,
    reason,
    fileId,
  }, userId, userName)
}

// ============ 记录手动输入 ============
export function logManualInput(
  field: string,
  value: any,
  fileId?: string,
  userId?: string,
  userName?: string
): AuditLog {
  return logAudit('MANUAL_INPUT', {
    field,
    newValue: value,
    reason: '用户手动输入',
    fileId,
  }, userId, userName)
}

// ============ 记录年份替换 ============
export function logYearReplacement(
  sourceYear: string,
  targetYear: string,
  fields: string[],
  fileId?: string
): AuditLog {
  return logAudit('YEAR_REPLACE', {
    field: 'year',
    oldValue: sourceYear,
    newValue: targetYear,
    reason: `自动替换年份: ${sourceYear} → ${targetYear}`,
    fields,
    fileId,
  })
}

// ============ 记录数据导出 ============
export function logExport(
  exportType: string,
  recordCount: number,
  fileId?: string,
  userId?: string
): AuditLog {
  return logAudit('EXPORT', {
    field: 'export',
    newValue: exportType,
    reason: `导出 ${recordCount} 条记录`,
    fileId,
  }, userId)
}

// ============ 获取操作历史摘要 ============
export function getAuditSummary(fileId?: string): {
  totalOperations: number
  aiSuggestions: number
  userOverrides: number
  manualInputs: number
  lastOperation?: AuditLog
} {
  const logs = fileId ? getAuditLogsByFileId(fileId) : auditLogs

  return {
    totalOperations: logs.length,
    aiSuggestions: logs.filter(l => l.action === 'AI_SUGGEST').length,
    userOverrides: logs.filter(l => l.action === 'USER_OVERRIDE').length,
    manualInputs: logs.filter(l => l.action === 'MANUAL_INPUT').length,
    lastOperation: logs[logs.length - 1],
  }
}

// ============ 清除日志（测试用） ============
export function clearAuditLogs(): void {
  auditLogs = []
}

// ============ 导出日志为 JSON ============
export function exportAuditLogsAsJson(): string {
  return JSON.stringify(auditLogs, null, 2)
}
