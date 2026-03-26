import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface SpreadsheetCell {
  value: string | number
  bg?: string
  color?: string
  bold?: boolean
  italic?: boolean
  align?: 'left' | 'center' | 'right'
  editable?: boolean
}

export interface SpreadsheetProps {
  headers: string[]
  rows: SpreadsheetCell[][]
  columnWidths?: number[]
  height?: number
  title?: string
  onCellChange?: (row: number, col: number, value: string) => void
  className?: string
}

export function Spreadsheet({
  headers,
  rows,
  columnWidths,
  height = 500,
  title,
  onCellChange,
  className,
}: SpreadsheetProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  const handleDoubleClick = useCallback((row: number, col: number, cell: SpreadsheetCell) => {
    if (cell.editable !== false) {
      setEditingCell({ row, col })
      setEditValue(String(cell.value ?? ''))
    }
  }, [])

  const handleBlur = useCallback(() => {
    if (editingCell && onCellChange) {
      onCellChange(editingCell.row, editingCell.col, editValue)
    }
    setEditingCell(null)
  }, [editingCell, editValue, onCellChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }, [handleBlur])

  const colAlpha = (i: number) => String.fromCharCode(65 + i)

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-white', className)}>
      {/* 公式栏 */}
      <div className="flex items-center border-b border-border bg-gray-50 px-2 py-1.5 gap-2">
        <div className="w-16 text-center text-xs font-mono bg-white border border-border rounded px-2 py-0.5">
          {selectedCell ? `${colAlpha(selectedCell.col)}${selectedCell.row + 1}` : '--'}
        </div>
        <div className="text-xs text-gray-400 px-1">fx</div>
        <div className="flex-1 text-xs font-mono bg-white border border-border rounded px-2 py-0.5 min-h-[22px]">
          {selectedCell ? String(rows[selectedCell.row]?.[selectedCell.col]?.value ?? '') : ''}
        </div>
        {title && <div className="text-xs font-medium text-gray-500 ml-2">{title}</div>}
      </div>

      {/* 表格 */}
      <div style={{ height, overflow: 'auto' }}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 40 }} />
            {headers.map((_, i) => (
              <col key={i} style={{ width: columnWidths?.[i] ?? 120 }} />
            ))}
          </colgroup>

          {/* 列头 */}
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bg-gray-100 border-b border-r border-border text-[11px] text-gray-500 font-normal py-1" />
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="bg-gray-100 border-b border-r border-border text-[11px] text-gray-500 font-medium py-1 text-center"
                >
                  {colAlpha(i)}
                </th>
              ))}
            </tr>
            <tr>
              <th className="bg-gray-50 border-b border-r border-border text-[11px] text-gray-500 font-normal py-1.5" />
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="bg-gray-50 border-b border-r border-border text-xs font-semibold text-gray-700 py-1.5 px-2 text-center"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* 数据行 */}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="group hover:bg-blue-50/30">
                {/* 行号 */}
                <td className="bg-gray-50 border-b border-r border-border text-[11px] text-gray-400 text-center py-1 font-mono select-none">
                  {rowIdx + 1}
                </td>
                {row.map((cell, colIdx) => {
                  const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx
                  const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx

                  return (
                    <td
                      key={colIdx}
                      className={cn(
                        'border-b border-r border-border text-sm py-1 px-2 cursor-cell transition-colors',
                        isSelected && 'outline outline-2 outline-blue-500 outline-offset-[-2px]',
                        !isEditing && 'select-none'
                      )}
                      style={{
                        backgroundColor: cell.bg || undefined,
                        color: cell.color || undefined,
                        fontWeight: cell.bold ? 600 : undefined,
                        fontStyle: cell.italic ? 'italic' : undefined,
                        textAlign: cell.align || 'left',
                      }}
                      onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                      onDoubleClick={() => handleDoubleClick(rowIdx, colIdx, cell)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="w-full bg-white border border-blue-500 rounded px-1 py-0 text-sm outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <span className="block truncate">{cell.value}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between border-t border-border bg-gray-50 px-3 py-1 text-[11px] text-gray-400">
        <span>{rows.length} 行 x {headers.length} 列</span>
        <span>{title || 'Sheet1'}</span>
      </div>
    </div>
  )
}

export default Spreadsheet
