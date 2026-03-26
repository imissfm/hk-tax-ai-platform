import React, { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Luckysheet 类型声明
declare global {
  interface Window {
    luckysheet: any
    luckysheet_function: any
  }
}

export interface LuckysheetColumn {
  r: number
  v: {
    ct?: { fa: string; t: string }
    m?: string
    v?: string | number
    bg?: string
    fc?: string
    bl?: number
    ht?: number
    vt?: number
  }
}

export interface LuckysheetSheetData {
  name: string
  color?: string
  status?: number
  order?: number
  celldata: LuckysheetColumn[]
  config?: {
    columnlen?: Record<number, number>
    rowlen?: Record<number, number>
    merge?: Record<string, any>
  }
  frozen?: {
    type: string
    range?: { row_focus: number; column_focus: number }
  }
  calcChain?: any[]
  defaultColWidth?: number
  defaultRowHeight?: number
}

export interface LuckysheetProps {
  data: LuckysheetSheetData[]
  containerId?: string
  height?: string | number
  width?: string | number
  showToolbar?: boolean
  showStatisticBar?: boolean
  showSheetBar?: boolean
  showInfobar?: boolean
  enableAddRow?: boolean
  enableAddBackTop?: boolean
  userInfo?: boolean
  showConfigWindowResize?: boolean
  forceCalculation?: boolean
  rowHeaderWidth?: number
  columnHeaderHeight?: number
  defaultColWidth?: number
  defaultRowHeight?: number
  className?: string
  onChange?: (data: LuckysheetSheetData[]) => void
  onCellSelect?: (row: number, col: number, value: string) => void
}

export function Luckysheet({
  data,
  containerId = 'luckysheet-container',
  height = '100%',
  width = '100%',
  showToolbar = true,
  showStatisticBar = true,
  showSheetBar = true,
  showInfobar = true,
  enableAddRow = true,
  enableAddBackTop = true,
  userInfo = true,
  showConfigWindowResize = true,
  forceCalculation = true,
  rowHeaderWidth = 46,
  columnHeaderHeight = 25,
  defaultColWidth = 73,
  defaultRowHeight = 19,
  className,
  onChange,
  onCellSelect,
}: LuckysheetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const initLuckysheet = useCallback(() => {
    if (!window.luckysheet || initializedRef.current) return

    const options = {
      container: containerId,
      data: data,
      showtoolbar: showToolbar,
      showstatisticBarConfig: {
        count: showStatisticBar,
        view: showStatisticBar,
        filter: showStatisticBar,
      },
      showsheetbar: showSheetBar,
      showinfobar: showInfobar,
      enableAddRow: enableAddRow,
      enableAddBackTop: enableAddBackTop,
      userInfo: userInfo,
      showConfigWindowResize: showConfigWindowResize,
      forceCalculation: forceCalculation,
      rowHeaderWidth: rowHeaderWidth,
      columnHeaderHeight: columnHeaderHeight,
      defaultColWidth: defaultColWidth,
      defaultRowHeight: defaultRowHeight,
      hook: {
        cellUpdated: (r: number, c: number, oldValue: any, newValue: any) => {
          if (onChange) {
            const currentData = window.luckysheet.getAllSheets()
            onChange(currentData)
          }
        },
        rangeSelect: (range: any[]) => {
          if (onCellSelect && range.length > 0) {
            const { row, column } = range[0]
            const cellValue = window.luckysheet.getCellValue(row[0], column[0])
            onCellSelect(row[0], column[0], cellValue)
          }
        },
      },
    }

    window.luckysheet.create(options)
    initializedRef.current = true
  }, [
    containerId,
    data,
    showToolbar,
    showStatisticBar,
    showSheetBar,
    showInfobar,
    enableAddRow,
    enableAddBackTop,
    userInfo,
    showConfigWindowResize,
    forceCalculation,
    rowHeaderWidth,
    columnHeaderHeight,
    defaultColWidth,
    defaultRowHeight,
    onChange,
    onCellSelect,
  ])

  useEffect(() => {
    // 动态加载 Luckysheet 脚本和样式
    const loadLuckysheet = async () => {
      if (window.luckysheet) {
        initLuckysheet()
        return
      }

      // 加载 CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/pluginsCss.css'
      document.head.appendChild(link)

      const link2 = document.createElement('link')
      link2.rel = 'stylesheet'
      link2.href = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.css'
      document.head.appendChild(link2)

      // 加载 JS
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js'
      document.head.appendChild(script)

      await new Promise<void>((resolve) => {
        script.onload = () => resolve()
      })

      const script2 = document.createElement('script')
      script2.src = 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet-all.js'
      document.head.appendChild(script2)

      await new Promise<void>((resolve) => {
        script2.onload = () => resolve()
      })

      initLuckysheet()
    }

    loadLuckysheet()

    return () => {
      if (window.luckysheet && initializedRef.current) {
        try {
          window.luckysheet.destroy()
        } catch (e) {
          // 忽略销毁错误
        }
        initializedRef.current = false
      }
    }
  }, [initLuckysheet])

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={cn('luckysheet-container', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}

// 辅助函数：创建单元格数据
export function createCell(row: number, col: number, value: string | number, options?: {
  bg?: string
  fc?: string
  bold?: boolean
  format?: string
}): LuckysheetColumn {
  return {
    r: row,
    v: {
      v: value,
      m: String(value),
      bg: options?.bg,
      fc: options?.fc,
      bl: options?.bold ? 1 : 0,
      ct: options?.format ? { fa: options.format, t: 'n' } : undefined,
    },
  }
}

// 辅助函数：创建表头行
export function createHeaderRow(row: number, headers: string[], bg = '#f5f5f5', fc = '#333333'): LuckysheetColumn[] {
  return headers.map((header, col) => ({
    r: row,
    v: {
      v: header,
      m: header,
      bg,
      fc,
      bl: 1,
      ht: 0, // 居中
      vt: 0,
    },
  }))
}

// 辅助函数：创建数据行
export function createDataRow(row: number, values: (string | number)[]): LuckysheetColumn[] {
  return values.map((value, col) => ({
    r: row,
    v: {
      v: value,
      m: String(value),
    },
  }))
}

// 辅助函数：导出 Excel
export async function exportToExcel(filename: string = 'export.xlsx') {
  if (!window.luckysheet) return

  try {
    const data = window.luckysheet.getAllSheets()
    // 这里可以集成 xlsx.js 或其他导出库
    console.log('Export data:', data)
    alert('导出功能需要集成 xlsx 库')
  } catch (e) {
    console.error('Export error:', e)
  }
}

// 辅助函数：获取所有数据
export function getAllData(): LuckysheetSheetData[] | null {
  if (!window.luckysheet) return null
  return window.luckysheet.getAllSheets()
}

// 辅助函数：设置单元格值
export function setCellValue(row: number, col: number, value: string | number) {
  if (!window.luckysheet) return
  window.luckysheet.setCellValue(row, col, value)
}

// 辅助函数：获取单元格值
export function getCellValue(row: number, col: number): string | number | null {
  if (!window.luckysheet) return null
  return window.luckysheet.getCellValue(row, col)
}

export default Luckysheet
