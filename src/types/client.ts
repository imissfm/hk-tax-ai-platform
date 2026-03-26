// ============ 客户/集团相关类型 ============

export interface Client {
  id: string
  code: string
  name: string
  type: 'group' | 'standalone'
  description?: string
  industry?: string
  createdAt: Date
  updatedAt: Date
}

// ============ 集团相关类型 ============

export interface Group extends Client {
  type: 'group'
  taxId?: string
  countryOfIncorporation: string
  reportingCurrency: string
  fiscalYearEnd: string
  entities: Entity[]
  pillarTwoStatus: PillarTwoStatus
}

export interface PillarTwoStatus {
  isApplicable: boolean
  consolidatedRevenue?: number  // 集团合并收入
  reportingYear?: string
  currentETR?: number
  topUpTax?: number
  lastCalculated?: Date
  jurisdictions?: number  // 涉税管辖区数量
}

// ============ 实体/子公司相关类型 ============

export interface Entity extends Client {
  type: 'standalone'
  groupId: string
  groupName: string
  jurisdiction: Jurisdiction
  taxId: string
  registrationNumber: string
  incorporationDate?: Date
  reportingCurrency: string
  fiscalYearEnd: string
  businessType?: string
  isActive: boolean
}

export interface Jurisdiction {
  code: string         // HK, SG, JP, CN, US
  name: string         // 香港, 新加坡, 日本
  taxAuthority: string // IRD, IRAS, NTA
  taxTypes: TaxType[]
}

export type TaxType =
  | 'profits_tax'      // 利得税
  | 'salaries_tax'     // 薪俸税
  | 'property_tax'     // 物业税
  | 'pillar_two'       // Pillar Two
  | 'gst_vat'          // GST/VAT
  | 'withholding_tax'  // 预扣税

// ============ 项目/申报相关类型 ============

export interface TaxProject {
  id: string
  clientId: string      // 集团ID 或 实体ID
  clientType: 'group' | 'entity'
  clientName: string
  fiscalYear: string
  taxType: TaxType
  status: ProjectStatus
  progress: number
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export type ProjectStatus =
  | 'not_started'
  | 'data_collection'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'filed'

// ============ 全局状态类型 ============

export interface AppState {
  currentGroup: Group | null
  currentEntity: Entity | null
  availableGroups: Group[]
  availableEntities: Entity[]
  currentProjects: TaxProject[]
}

// ============ 菜单相关类型 ============

export interface MenuItem {
  id: string
  label: string
  shortLabel: string
  icon: string
  description: string
  badge?: string
  requiredScope: 'any' | 'group' | 'entity'  // 菜单适用范围
  disabled?: boolean
}

// ============ Mock 数据类型 ============

export interface MockGroupData {
  groups: Group[]
}

export interface MockEntityData {
  entities: Entity[]
}
