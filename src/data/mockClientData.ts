import type { Group, Entity } from '@/types/client'

// ============ 集团 Mock 数据 ============

export const mockGroups: Group[] = [
  {
    id: 'group-abc',
    code: 'ABC',
    name: 'ABC 国际集团',
    type: 'group',
    taxId: '12345678-000',
    countryOfIncorporation: 'Hong Kong',
    reportingCurrency: 'HKD',
    fiscalYearEnd: '12-31',
    industry: '国际贸易',
    description: 'ABC 国际集团是一家跨国贸易集团',
    pillarTwoStatus: {
      isApplicable: true,
      consolidatedRevenue: 150000000,
      currentETR: 18.5,
      topUpTax: 2500000,
      reportingYear: '2024',
      lastCalculated: new Date('2024-03-15'),
    },
    entities: [],
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'group-xyz',
    code: 'XYZ',
    name: 'XYZ 科技集团',
    type: 'group',
    taxId: '87654321-000',
    countryOfIncorporation: 'Singapore',
    reportingCurrency: 'SGD',
    fiscalYearEnd: '12-31',
    industry: '科技',
    description: 'XYZ 科技集团是一家跨国科技公司',
    pillarTwoStatus: {
      isApplicable: true,
      consolidatedRevenue: 85000000,
      currentETR: 16.2,
      topUpTax: 1800000,
      reportingYear: '2024',
      lastCalculated: new Date('2024-02-28'),
    },
    entities: [],
    createdAt: new Date('2019-06-15'),
    updatedAt: new Date(),
  },
  {
    id: 'group-dahua',
    code: 'DHG',
    name: '大华集团控股',
    type: 'group',
    taxId: '56789012-000',
    countryOfIncorporation: 'Hong Kong',
    reportingCurrency: 'HKD',
    fiscalYearEnd: '03-31',
    industry: '综合企业',
    description: '大华集团控股是一家香港本地企业',
    pillarTwoStatus: {
      isApplicable: false,
      consolidatedRevenue: 25000000,
    },
    entities: [],
    createdAt: new Date('2018-03-10'),
    updatedAt: new Date(),
  },
]

// ============ 实体 Mock 数据 ============

export const mockEntities: Entity[] = [
  // ABC 集团实体
  {
    id: 'ent-abc-hk',
    code: 'ABC-HK',
    name: 'ABC 国际贸易有限公司',
    type: 'standalone',
    groupId: 'group-abc',
    groupName: 'ABC 国际集团',
    taxId: '12345678-001',
    registrationNumber: 'CR123456',
    jurisdiction: {
      code: 'HK',
      name: '香港',
      taxAuthority: 'IRD',
      taxTypes: ['profits_tax', 'salaries_tax'],
    },
    reportingCurrency: 'HKD',
    fiscalYearEnd: '12-31',
    businessType: '贸易',
    isActive: true,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'ent-abc-sg',
    code: 'ABC-SG',
    name: 'ABC Singapore Pte Ltd',
    type: 'standalone',
    groupId: 'group-abc',
    groupName: 'ABC 国际集团',
    taxId: '201012345A',
    registrationNumber: 'SG201012345A',
    jurisdiction: {
      code: 'SG',
      name: '新加坡',
      taxAuthority: 'IRAS',
      taxTypes: ['profits_tax', 'gst_vat'],
    },
    reportingCurrency: 'SGD',
    fiscalYearEnd: '12-31',
    businessType: '贸易',
    isActive: true,
    createdAt: new Date('2015-06-20'),
    updatedAt: new Date(),
  },
  {
    id: 'ent-abc-jp',
    code: 'ABC-JP',
    name: 'ABC Japan K.K.',
    type: 'standalone',
    groupId: 'group-abc',
    groupName: 'ABC 国际集团',
    taxId: '0123456789',
    registrationNumber: 'JP0123456789',
    jurisdiction: {
      code: 'JP',
      name: '日本',
      taxAuthority: 'NTA',
      taxTypes: ['profits_tax', 'withholding_tax'],
    },
    reportingCurrency: 'JPY',
    fiscalYearEnd: '03-31',
    businessType: '销售',
    isActive: true,
    createdAt: new Date('2018-03-10'),
    updatedAt: new Date(),
  },
  // XYZ 集团实体
  {
    id: 'ent-xyz-hk',
    code: 'XYZ-HK',
    name: 'XYZ 科技香港有限公司',
    type: 'standalone',
    groupId: 'group-xyz',
    groupName: 'XYZ 科技集团',
    taxId: '87654321-001',
    registrationNumber: 'CR87654321',
    jurisdiction: {
      code: 'HK',
      name: '香港',
      taxAuthority: 'IRD',
      taxTypes: ['profits_tax', 'salaries_tax'],
    },
    reportingCurrency: 'HKD',
    fiscalYearEnd: '12-31',
    businessType: '科技服务',
    isActive: true,
    createdAt: new Date('2017-03-15'),
    updatedAt: new Date(),
  },
  {
    id: 'ent-xyz-sg',
    code: 'XYZ-SG',
    name: 'XYZ Tech Singapore Pte Ltd',
    type: 'standalone',
    groupId: 'group-xyz',
    groupName: 'XYZ 科技集团',
    taxId: '202045678B',
    registrationNumber: 'SG202045678B',
    jurisdiction: {
      code: 'SG',
      name: '新加坡',
      taxAuthority: 'IRAS',
      taxTypes: ['profits_tax', 'gst_vat'],
    },
    reportingCurrency: 'SGD',
    fiscalYearEnd: '12-31',
    businessType: '研发',
    isActive: true,
    createdAt: new Date('2018-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'ent-xyz-my',
    code: 'XYZ-MY',
    name: 'XYZ Malaysia Sdn Bhd',
    type: 'standalone',
    groupId: 'group-xyz',
    groupName: 'XYZ 科技集团',
    taxId: 'MY12345678',
    registrationNumber: 'MY12345678',
    jurisdiction: {
      code: 'MY',
      name: '马来西亚',
      taxAuthority: 'LHDN',
      taxTypes: ['profits_tax', 'gst_vat'],
    },
    reportingCurrency: 'MYR',
    fiscalYearEnd: '12-31',
    businessType: '制造',
    isActive: true,
    createdAt: new Date('2019-04-01'),
    updatedAt: new Date(),
  },
  {
    id: 'ent-xyz-tw',
    code: 'XYZ-TW',
    name: 'XYZ Taiwan Co., Ltd',
    type: 'standalone',
    groupId: 'group-xyz',
    groupName: 'XYZ 科技集团',
    taxId: 'TW12345678',
    registrationNumber: 'TW12345678',
    jurisdiction: {
      code: 'TW',
      name: '台湾',
      taxAuthority: 'MOF',
      taxTypes: ['profits_tax'],
    },
    reportingCurrency: 'TWD',
    fiscalYearEnd: '12-31',
    businessType: '销售',
    isActive: true,
    createdAt: new Date('2020-02-01'),
    updatedAt: new Date(),
  },
  // 大华集团实体
  {
    id: 'ent-dhg-hk',
    code: 'DHG-HK',
    name: '大华集团香港有限公司',
    type: 'standalone',
    groupId: 'group-dahua',
    groupName: '大华集团控股',
    taxId: '56789012-001',
    registrationNumber: 'CR56789012',
    jurisdiction: {
      code: 'HK',
      name: '香港',
      taxAuthority: 'IRD',
      taxTypes: ['profits_tax', 'salaries_tax', 'property_tax'],
    },
    reportingCurrency: 'HKD',
    fiscalYearEnd: '03-31',
    businessType: '综合企业',
    isActive: true,
    createdAt: new Date('2018-03-10'),
    updatedAt: new Date(),
  },
]

// ============ 辅助函数 ============

export function getEntitiesByGroup(groupId: string): Entity[] {
  return mockEntities.filter(e => e.groupId === groupId)
}

export function getGroupById(groupId: string): Group | undefined {
  return mockGroups.find(g => g.id === groupId)
}

export function getEntityById(entityId: string): Entity | undefined {
  return mockEntities.find(e => e.id === entityId)
}

export function getAllGroups(): Group[] {
  return mockGroups.map(g => ({
    ...g,
    entities: mockEntities.filter(e => e.groupId === g.id),
  }))
}
