// 利得税计算 FortuneSheet 数据模板
// 完全复刻 PwC Total Tax Management Platform 截图中的 IRD Profits Tax Computation

import type { Sheet, CellWithRowAndCol, Cell } from '@/components/ui/FortuneSheet'

// 辅助函数：创建单元格
function cell(r: number, c: number, value: string | number, opts?: {
  bg?: string
  fc?: string
  bl?: number  // 1=bold
  it?: number  // 1=italic
  ht?: number  // 0=center, 1=left, 2=right
  vt?: number  // 0=middle, 1=top, 2=bottom
  fs?: number  // font size
  tb?: string  // wrap text
  mc?: { r: number; c: number; rs: number; cs: number }  // merge config
}): CellWithRowAndCol {
  const v: Cell = {
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
  return { r, c, v }
}

// ============ PART 1 区域 ============

const partHeaderBg = '#D9D9D9'
const yellowBg = '#FFF2CC'
const lightGrayBg = '#F5F5F5'
const whiteBg = '#FFFFFF'
const numberFc = '#333333'
const labelFc = '#333333'

function buildCellData() {
  const cells: any[] = []

  // Row 0: 顶部问题行
  cells.push(cell(0, 0, 'Do you claim debt treatment for an arrangement for this year of assessment as "an originator" or "a bond issuer" of a specified alternative bond scheme under section 40M and schedule 17C of the Inland Revenue Ordinance?', {
    ht: 1, vt: 1, tb: 1, fs: 9, fc: '#555555',
    mc: { r: 0, c: 0, rs: 1, cs: 5 },
  }))

  // Row 1: 空行
  // Row 2: PART 1 标题
  cells.push(cell(2, 0, 'PART 1', { bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 0 }))
  cells.push(cell(2, 1, 'STATEMENT OF ASSESSABLE PROFITS OR ADJUSTED LOSS', {
    bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 1,
    mc: { r: 2, c: 1, rs: 1, cs: 4 },
  }))

  // Row 3: 空行

  // Row 4: Assessable Profits (Sales (per books brought forward))
  cells.push(cell(4, 0, '', { bg: whiteBg }))
  cells.push(cell(4, 1, 'Assessable Profits (Sales (per books brought forward))', { bg: whiteBg, fs: 9 }))
  cells.push(cell(4, 2, '', { bg: whiteBg }))
  cells.push(cell(4, 3, '1,456,930', { bg: whiteBg, ht: 2, fc: numberFc }))
  cells.push(cell(4, 4, '1,456,930', { bg: whiteBg, ht: 2, fc: numberFc }))

  // Row 5: Less: Adjusted Loss Before Loss Brought Forward
  cells.push(cell(5, 0, '', { bg: whiteBg }))
  cells.push(cell(5, 1, 'Less: Adjusted Loss Before Loss Brought Forward', { bg: whiteBg, fs: 9 }))
  cells.push(cell(5, 2, '', { bg: whiteBg }))
  cells.push(cell(5, 3, '', { bg: whiteBg }))
  cells.push(cell(5, 4, '', { bg: whiteBg }))

  // Row 6: Adjusted Loss Before loss brought forward
  cells.push(cell(6, 0, '', { bg: whiteBg }))
  cells.push(cell(6, 1, 'Adjusted Loss Before loss brought forward', { bg: whiteBg, fs: 9, ht: 1 }))
  cells.push(cell(6, 2, '', { bg: whiteBg }))
  cells.push(cell(6, 3, '1,456,930', { bg: whiteBg, ht: 2, fc: numberFc }))
  cells.push(cell(6, 4, '', { bg: whiteBg }))

  // Row 7: Loss carried forward from prior year (If NIL, enter "0")
  cells.push(cell(7, 0, '', { bg: whiteBg }))
  cells.push(cell(7, 1, 'Loss carried forward from prior year  If NIL, enter "0"', { bg: whiteBg, fs: 9 }))
  cells.push(cell(7, 2, '', { bg: whiteBg }))
  cells.push(cell(7, 3, '42,855', { bg: whiteBg, ht: 2, fc: numberFc }))
  cells.push(cell(7, 4, '(42,855)', { bg: whiteBg, ht: 2, fc: numberFc }))

  // Row 8: NET
  cells.push(cell(8, 0, '', { bg: lightGrayBg }))
  cells.push(cell(8, 1, 'NET', { bg: lightGrayBg, bl: 1, fs: 10 }))
  cells.push(cell(8, 2, '', { bg: lightGrayBg }))
  cells.push(cell(8, 3, '', { bg: lightGrayBg }))
  cells.push(cell(8, 4, '1,414,075', { bg: lightGrayBg, ht: 2, bl: 1, fc: numberFc }))

  // Row 9: 空行

  // Row 10: PART 1A 标题
  cells.push(cell(10, 0, 'PART 1A', { bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 0 }))
  cells.push(cell(10, 1, 'CALCULATION OF TAX PAYABLE', {
    bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 1,
    mc: { r: 10, c: 1, rs: 1, cs: 4 },
  }))

  // Row 11: 空行

  // Row 12: Tax Payable
  cells.push(cell(12, 0, '', { bg: whiteBg }))
  cells.push(cell(12, 1, 'Tax Payable  If NIL, enter "0"', { bg: whiteBg, fs: 9 }))
  cells.push(cell(12, 2, '', { bg: whiteBg }))
  cells.push(cell(12, 3, '', { bg: whiteBg }))
  cells.push(cell(12, 4, '233,322', { bg: whiteBg, ht: 2, bl: 1, fc: numberFc }))

  // Row 13: 空行

  // Row 14: 问题行 - designated interest entity
  cells.push(cell(14, 0, 'Are you designated as an interest entity for this year of assessment? (i.e. a corporation with connected entities, or other entity designated by the Commissioner of Inland Revenue)', {
    ht: 1, vt: 1, tb: 1, fs: 9, fc: '#555555',
    mc: { r: 14, c: 0, rs: 1, cs: 5 },
  }))

  // Row 15: 空行

  // ============ PART 2 区域 ============

  // Row 16: PART 2 标题
  cells.push(cell(16, 0, 'PART 2', { bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 0 }))
  cells.push(cell(16, 1, 'GROSS INCOME, SPECIFIED TRANSACTIONS AND MATTERS', {
    bl: 1, bg: partHeaderBg, fc: '#000000', fs: 10, ht: 1,
    mc: { r: 16, c: 1, rs: 1, cs: 4 },
  }))

  // Row 17: 空行

  // Row 18: 问题 - 知识产权
  cells.push(cell(18, 0, '', { bg: whiteBg }))
  cells.push(cell(18, 1, 'During this basis period, did you pay or accrue to a non-resident person any sum for the use/assignment of intellectual property rights in Hong Kong? If so, submit details of the tax so paid to the IRD and include the sum from S.LX', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 18, c: 1, rs: 2, cs: 3 },
  }))
  cells.push(cell(18, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 20: 空行

  // Row 21: 问题 - section 20AC
  cells.push(cell(21, 0, '', { bg: whiteBg }))
  cells.push(cell(21, 1, 'Did you for this year of assessment (offering under section 20AC, 20AF and/or 20AH of the Inland Revenue Ordinance)?', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 21, c: 1, rs: 1, cs: 3 },
  }))
  cells.push(cell(21, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 22: 空行

  // Row 23: 问题 - Assessable Profits arising from
  cells.push(cell(23, 0, '', { bg: whiteBg }))
  cells.push(cell(23, 1, 'Enter the amount of the Assessable Profits/Adjusted Loss claimed in Part 1 which are wholly, principally arising from qualifying activities under the relevant concession.', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 23, c: 1, rs: 2, cs: 3 },
  }))
  cells.push(cell(23, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 25: 空行

  // Row 26: 问题 - double taxation
  cells.push(cell(26, 0, '', { bg: whiteBg }))
  cells.push(cell(26, 1, 'Do you claim tax relief for this year of assessment pursuant to an arrangement for avoidance of double taxation specified in the schedule to the relevant order under section 49 of the IRO?', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 26, c: 1, rs: 2, cs: 3 },
  }))
  cells.push(cell(26, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 28: 空行

  // Row 29: 问题 - advance ruling
  cells.push(cell(29, 0, '', { bg: whiteBg }))
  cells.push(cell(29, 1, 'Have you obtained an advance ruling relating to this year of assessment?', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 29, c: 1, rs: 1, cs: 3 },
  }))
  cells.push(cell(29, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 30: 空行

  // Row 31: 问题 - debt treatment (重复)
  cells.push(cell(31, 0, '', { bg: yellowBg }))
  cells.push(cell(31, 1, 'Do you claim debt treatment for an arrangement for this year of assessment as "an originator" or "as recognized proof" of a specified alternative bond scheme under section 40M and schedule 17C of the Inland Revenue Ordinance?', {
    bg: yellowBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 31, c: 1, rs: 2, cs: 3 },
  }))
  cells.push(cell(31, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 33: 空行

  // Row 34: 问题 - regulatory capital
  cells.push(cell(34, 0, '', { bg: whiteBg }))
  cells.push(cell(34, 1, 'Do you claim deduction for distribution arising from regulatory capital security for this year of assessment?', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 34, c: 1, rs: 1, cs: 3 },
  }))
  cells.push(cell(34, 4, '', { bg: yellowBg, ht: 0 }))

  // Row 35: 空行

  // Row 36: 问题 - permanent establishment
  cells.push(cell(36, 0, '', { bg: whiteBg }))
  cells.push(cell(36, 1, 'Were you a permanent establishment in Hong Kong of a non-Hong Kong resident person for this year of assessment? If yes, complete PART 11B and 11D.', {
    bg: whiteBg, fs: 9, tb: 1, vt: 1,
    mc: { r: 36, c: 1, rs: 1, cs: 3 },
  }))
  cells.push(cell(36, 4, '', { bg: yellowBg, ht: 0 }))

  return cells
}

// 合并单元格配置
function buildMergeConfig() {
  return {
    '0_0': { r: 0, c: 0, rs: 1, cs: 5 },
    '2_1': { r: 2, c: 1, rs: 1, cs: 4 },
    '10_1': { r: 10, c: 1, rs: 1, cs: 4 },
    '14_0': { r: 14, c: 0, rs: 1, cs: 5 },
    '16_1': { r: 16, c: 1, rs: 1, cs: 4 },
    '18_1': { r: 18, c: 1, rs: 2, cs: 3 },
    '21_1': { r: 21, c: 1, rs: 1, cs: 3 },
    '23_1': { r: 23, c: 1, rs: 2, cs: 3 },
    '26_1': { r: 26, c: 1, rs: 2, cs: 3 },
    '29_1': { r: 29, c: 1, rs: 1, cs: 3 },
    '31_1': { r: 31, c: 1, rs: 2, cs: 3 },
    '34_1': { r: 34, c: 1, rs: 1, cs: 3 },
    '36_1': { r: 36, c: 1, rs: 1, cs: 3 },
  }
}

// 导出完整 sheet 数据
export function getProfitsTaxSheetData(): Sheet[] {
  return [
    {
      name: 'Page 1',
      id: 'page-1',
      color: '',
      status: 1,
      order: 0,
      celldata: buildCellData(),
      config: {
        columnlen: {
          0: 60,
          1: 420,
          2: 100,
          3: 120,
          4: 120,
        },
        rowlen: {
          0: 40,
          2: 28,
          10: 28,
          14: 40,
          16: 28,
          18: 50,
          21: 35,
          23: 50,
          26: 50,
          29: 28,
          31: 50,
          34: 35,
          36: 35,
        },
        merge: buildMergeConfig(),
      },
      defaultColWidth: 100,
      defaultRowHeight: 22,
    },
  ]
}

// 左侧导航树数据
export interface NavTreeItem {
  id: string
  label: string
  children?: NavTreeItem[]
  active?: boolean
}

export const profitsTaxNavTree: NavTreeItem[] = [
  {
    id: 'profits-tax',
    label: 'Profits Tax Computation',
    children: [
      { id: 'working-paper', label: 'Working paper' },
      {
        id: 'tax-analysis',
        label: 'Tax analysis',
        children: [
          { id: 'page-1', label: 'Page 1', active: true },
          { id: 'page-2', label: 'Page 2' },
          { id: 'page-3', label: 'Page 3' },
          { id: 'page-4', label: 'Page 4' },
        ],
      },
      { id: 's-filing', label: 'S Filing' },
      { id: 'sd', label: 'SD' },
    ],
  },
  { id: 'control-statement', label: 'Control statement' },
  { id: 'review-note', label: 'Review note summary' },
  { id: 'data-transfer', label: 'Data transfer list' },
]
