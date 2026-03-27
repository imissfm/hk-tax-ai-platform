import { Workbook } from '@fortune-sheet/react'
import '@fortune-sheet/react/dist/index.css'
import type { Sheet, CellWithRowAndCol, Cell } from '@fortune-sheet/core'

export type { Sheet, CellWithRowAndCol, Cell }

export interface FortuneSheetProps {
  data: Sheet[]
  height?: string | number
  width?: string | number
  showToolbar?: boolean
  showFormulaBar?: boolean
  showSheetTabs?: boolean
  allowEdit?: boolean
  className?: string
  onChange?: (data: Sheet[]) => void
}

export function FortuneSheet({
  data,
  height = '100%',
  width = '100%',
  showToolbar = true,
  showFormulaBar = false,
  showSheetTabs = false,
  allowEdit = true,
  className,
  onChange,
}: FortuneSheetProps) {
  return (
    <div
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    >
      <Workbook
        data={data}
        showToolbar={showToolbar}
        showFormulaBar={showFormulaBar}
        showSheetTabs={showSheetTabs}
        allowEdit={allowEdit}
        onChange={onChange}
      />
    </div>
  )
}

// 辅助函数：创建单元格
export function createCell(r: number, c: number, value: string | number, opts?: {
  bg?: string
  fc?: string
  bl?: number
  it?: number
  ht?: number
  vt?: number
  fs?: number
  tb?: string
  mc?: { r: number; c: number; rs: number; cs: number }
}): CellWithRowAndCol {
  const cell: Cell = {
    v: value,
    m: String(value),
    bg: opts?.bg,
    fc: opts?.fc || '#333333',
    bl: opts?.bl ?? 0,
    it: opts?.it ?? 0,
    ht: opts?.ht ?? 1,
    vt: opts?.vt ?? 0,
    fs: opts?.fs || 10,
    tb: opts?.tb,
    mc: opts?.mc,
  }
  return { r, c, v: cell }
}

export default FortuneSheet
