import type { DashboardData, DashboardStats, Project, RecentAccessItem, TodoItem, Notification } from '@/types/dashboard'

// ============ 核心指标 Mock ============
// 每个集团的指标
export const groupStats: Record<string, DashboardStats> = {
  'group-abc': {
    activeProjects: 3,
    pendingTasks: 8,
    completedThisWeek: 2,
    aiProcessing: 2,
  },
  'group-xyz': {
    activeProjects: 4,
    pendingTasks: 6,
    completedThisWeek: 1,
    aiProcessing: 1,
  },
  'group-dahua': {
    activeProjects: 1,
    pendingTasks: 2,
    completedThisWeek: 2,
    aiProcessing: 0,
  },
}

// 全局指标（未选择时）
export const globalStats: DashboardStats = {
  activeProjects: 8,
  pendingTasks: 16,
  completedThisWeek: 5,
  aiProcessing: 3,
}

// ============ 项目进度 Mock ============
export const mockProjects: Project[] = [
  // ABC 集团项目
  {
    id: 'proj-abc-001',
    groupId: 'group-abc',
    entityId: 'ent-abc-hk',
    clientName: 'ABC 国际贸易有限公司',
    projectName: '2024/25 年度税务申报',
    fiscalYear: '2024/25',
    overallProgress: 72,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'in-progress', progress: 65, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-20' },
      aiParsing: { status: 'completed', completedAt: '2024-03-20' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-25T14:30:00',
    deadline: '2024-04-30',
  },
  {
    id: 'proj-abc-002',
    groupId: 'group-abc',
    entityId: 'ent-abc-sg',
    clientName: 'ABC Singapore Pte Ltd',
    projectName: '2024/25 年度税务申报',
    fiscalYear: '2024/25',
    overallProgress: 55,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'in-progress', progress: 55, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-18' },
      aiParsing: { status: 'completed', completedAt: '2024-03-19' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-24T10:00:00',
    deadline: '2024-05-15',
  },
  {
    id: 'proj-abc-003',
    groupId: 'group-abc',
    entityId: 'ent-abc-jp',
    clientName: 'ABC Japan K.K.',
    projectName: '2024 年度税务申报',
    fiscalYear: '2024',
    overallProgress: 30,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'in-progress', progress: 30, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-10' },
      aiParsing: { status: 'pending' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-23T16:00:00',
    deadline: '2024-05-31',
  },
  // XYZ 集团项目
  {
    id: 'proj-xyz-001',
    groupId: 'group-xyz',
    entityId: 'ent-xyz-hk',
    clientName: 'XYZ 科技香港有限公司',
    projectName: '2024/25 年度税务申报',
    fiscalYear: '2024/25',
    overallProgress: 45,
    status: 'at-risk',
    workflows: {
      pillarTwo: { status: 'in-progress', progress: 45, hasIssues: true },
      profitsTax: { status: 'pending', progress: 0, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-22' },
      aiParsing: { status: 'error' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-25T10:15:00',
    deadline: '2024-05-15',
  },
  {
    id: 'proj-xyz-002',
    groupId: 'group-xyz',
    entityId: 'ent-xyz-sg',
    clientName: 'XYZ Tech Singapore Pte Ltd',
    projectName: '2024/25 年度税务申报',
    fiscalYear: '2024/25',
    overallProgress: 80,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'completed', progress: 100, hasIssues: false },
      returnFilling: { status: 'in-progress', progress: 40, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-15' },
      aiParsing: { status: 'completed', completedAt: '2024-03-16' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-25T09:00:00',
    deadline: '2024-04-30',
  },
  {
    id: 'proj-xyz-003',
    groupId: 'group-xyz',
    entityId: 'ent-xyz-my',
    clientName: 'XYZ Malaysia Sdn Bhd',
    projectName: '2024 年度税务申报',
    fiscalYear: '2024',
    overallProgress: 60,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'in-progress', progress: 60, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-20' },
      aiParsing: { status: 'completed', completedAt: '2024-03-21' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-24T14:00:00',
    deadline: '2024-06-30',
  },
  {
    id: 'proj-xyz-004',
    groupId: 'group-xyz',
    entityId: 'ent-xyz-tw',
    clientName: 'XYZ Taiwan Co., Ltd',
    projectName: '2024 年度税务申报',
    fiscalYear: '2024',
    overallProgress: 25,
    status: 'delayed',
    workflows: {
      pillarTwo: { status: 'in-progress', progress: 25, hasIssues: true },
      profitsTax: { status: 'pending', progress: 0, hasIssues: false },
      returnFilling: { status: 'pending', progress: 0, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'pending' },
      aiParsing: { status: 'pending' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-23T11:00:00',
    deadline: '2024-05-31',
  },
  // 大华集团项目
  {
    id: 'proj-dhg-001',
    groupId: 'group-dahua',
    entityId: 'ent-dhg-hk',
    clientName: '大华集团香港有限公司',
    projectName: '2024/25 年度税务申报',
    fiscalYear: '2024/25',
    overallProgress: 95,
    status: 'on-track',
    workflows: {
      pillarTwo: { status: 'completed', progress: 100, hasIssues: false },
      profitsTax: { status: 'completed', progress: 100, hasIssues: false },
      returnFilling: { status: 'review', progress: 90, hasIssues: false },
    },
    modules: {
      dataUpload: { status: 'completed', completedAt: '2024-03-15' },
      aiParsing: { status: 'completed', completedAt: '2024-03-16' },
      exportDelivery: { status: 'pending' },
    },
    updatedAt: '2024-03-25T16:00:00',
    deadline: '2024-04-15',
  },
]

// ============ 最近访问 Mock ============
export const mockRecentAccess: RecentAccessItem[] = [
  {
    id: 'recent-001',
    type: 'project',
    title: 'ABC 国际贸易 - 利得税计算',
    subtitle: '进行中 · 65% 完成',
    pageId: 'profits-tax',
    projectId: 'proj-abc-001',
    groupId: 'group-abc',
    entityId: 'ent-abc-hk',
    accessedAt: '2024-03-25T14:30:00',
    icon: 'Calculator',
  },
  {
    id: 'recent-002',
    type: 'page',
    title: '数据上传与解析',
    pageId: 'upload',
    groupId: 'group-abc',
    entityId: 'ent-abc-hk',
    accessedAt: '2024-03-25T11:00:00',
    icon: 'UploadCloud',
  },
  {
    id: 'recent-003',
    type: 'project',
    title: '大华集团 - Return 填报',
    subtitle: '待审核 · 90% 完成',
    pageId: 'return-filling',
    projectId: 'proj-dhg-001',
    groupId: 'group-dahua',
    entityId: 'ent-dhg-hk',
    accessedAt: '2024-03-25T09:45:00',
    icon: 'FileText',
  },
  {
    id: 'recent-004',
    type: 'page',
    title: 'Pillar Two HKMTT',
    pageId: 'pillar-two',
    groupId: 'group-xyz',
    accessedAt: '2024-03-24T16:20:00',
    icon: 'Globe',
  },
  {
    id: 'recent-005',
    type: 'page',
    title: '导出与交付',
    pageId: 'export',
    groupId: 'group-abc',
    accessedAt: '2024-03-24T14:00:00',
    icon: 'Download',
  },
]

// ============ 待办事项 Mock ============
export const mockTodos = {
  aiReview: [
    {
      id: 'todo-001',
      category: 'ai-review' as const,
      title: 'AI 识别的调整项需要确认',
      description: '发现 12 个税务调整项，请审核 AI 建议的处理方式',
      priority: 'high' as const,
      groupId: 'group-abc',
      entityId: 'ent-abc-hk',
      projectId: 'proj-abc-001',
      projectName: 'ABC 国际贸易',
      pageId: 'profits-tax',
      dueDate: '2024-03-27',
      createdAt: '2024-03-25T10:00:00',
      completed: false,
    },
    {
      id: 'todo-002',
      category: 'ai-review' as const,
      title: 'Pillar Two ETR 计算结果待确认',
      description: 'AI 计算的 ETR 为 15.01%，需确认是否满足 GloBE 规则',
      priority: 'medium' as const,
      groupId: 'group-dahua',
      entityId: 'ent-dhg-hk',
      projectId: 'proj-dhg-001',
      projectName: '大华集团',
      pageId: 'pillar-two',
      createdAt: '2024-03-24T15:00:00',
      completed: false,
    },
    {
      id: 'todo-003',
      category: 'ai-review' as const,
      title: '转让定价分析报告已生成',
      description: 'AI 已完成关联方交易分析，请审核报告内容',
      priority: 'low' as const,
      groupId: 'group-abc',
      entityId: 'ent-abc-sg',
      projectId: 'proj-abc-002',
      projectName: 'ABC Singapore',
      pageId: 'cover-letter',
      createdAt: '2024-03-25T08:00:00',
      completed: true,
    },
    {
      id: 'todo-010',
      category: 'ai-review' as const,
      title: 'XYZ 香港数据解析异常需确认',
      description: 'AI 解析发现异常数据，请确认处理方式',
      priority: 'urgent' as const,
      groupId: 'group-xyz',
      entityId: 'ent-xyz-hk',
      projectId: 'proj-xyz-001',
      projectName: 'XYZ 科技香港',
      pageId: 'upload',
      createdAt: '2024-03-25T10:15:00',
      completed: false,
    },
  ],
  dataMissing: [
    {
      id: 'todo-004',
      category: 'data-missing' as const,
      title: '关联方交易明细缺失',
      description: '需要补充关联方交易明细表，以便完成转让定价分析',
      priority: 'urgent' as const,
      groupId: 'group-xyz',
      entityId: 'ent-xyz-hk',
      projectId: 'proj-xyz-001',
      projectName: 'XYZ 科技香港',
      pageId: 'upload',
      createdAt: '2024-03-24T09:00:00',
      completed: false,
    },
    {
      id: 'todo-005',
      category: 'data-missing' as const,
      title: '台湾子公司财务数据不完整',
      description: '部分固定资产的折旧数据缺失，请补充完整',
      priority: 'high' as const,
      groupId: 'group-xyz',
      entityId: 'ent-xyz-tw',
      projectId: 'proj-xyz-004',
      projectName: 'XYZ Taiwan',
      pageId: 'upload',
      createdAt: '2024-03-24T11:00:00',
      completed: false,
    },
  ],
  deadline: [
    {
      id: 'todo-006',
      category: 'deadline' as const,
      title: '大华集团申报截止日期临近',
      description: '2024/25 税务申报将于 4月15日 截止，仅剩 20 天',
      priority: 'urgent' as const,
      groupId: 'group-dahua',
      entityId: 'ent-dhg-hk',
      projectId: 'proj-dhg-001',
      projectName: '大华集团',
      dueDate: '2024-04-15',
      createdAt: '2024-03-25T00:00:00',
      completed: false,
    },
    {
      id: 'todo-007',
      category: 'deadline' as const,
      title: 'ABC 国际贸易申报截止提醒',
      description: '2024/25 税务申报将于 4月30日 截止',
      priority: 'high' as const,
      groupId: 'group-abc',
      entityId: 'ent-abc-hk',
      projectId: 'proj-abc-001',
      projectName: 'ABC 国际贸易',
      dueDate: '2024-04-30',
      createdAt: '2024-03-25T00:00:00',
      completed: false,
    },
    {
      id: 'todo-011',
      category: 'deadline' as const,
      title: 'XYZ Singapore 申报截止提醒',
      description: '2024/25 税务申报将于 4月30日 截止',
      priority: 'high' as const,
      groupId: 'group-xyz',
      entityId: 'ent-xyz-sg',
      projectId: 'proj-xyz-002',
      projectName: 'XYZ Singapore',
      dueDate: '2024-04-30',
      createdAt: '2024-03-25T00:00:00',
      completed: false,
    },
  ],
  approval: [
    {
      id: 'todo-008',
      category: 'approval' as const,
      title: '等待合伙人审批',
      description: '大华集团利得税计算表已提交，等待合伙人最终审批',
      priority: 'medium' as const,
      groupId: 'group-dahua',
      entityId: 'ent-dhg-hk',
      projectId: 'proj-dhg-001',
      projectName: '大华集团',
      assignee: '张合伙人',
      createdAt: '2024-03-24T16:00:00',
      completed: false,
    },
    {
      id: 'todo-009',
      category: 'approval' as const,
      title: '等待经理复核',
      description: 'ABC 国际贸易 Pillar Two 计算表待复核',
      priority: 'low' as const,
      groupId: 'group-abc',
      entityId: 'ent-abc-hk',
      projectId: 'proj-abc-001',
      projectName: 'ABC 国际贸易',
      assignee: '李经理',
      createdAt: '2024-03-25T10:00:00',
      completed: false,
    },
  ],
}

// ============ 通知 Mock ============
export const mockNotifications = {
  urgent: [
    {
      id: 'notif-001',
      type: 'urgent' as const,
      title: 'AI 解析异常',
      message: 'XYZ 科技香港的财务报表解析失败，请手动检查文件格式',
      groupId: 'group-xyz',
      entityId: 'ent-xyz-hk',
      createdAt: '2024-03-25T10:15:00',
      read: false,
      actionLabel: '查看详情',
      actionPageId: 'upload',
    },
  ],
  system: [
    {
      id: 'notif-002',
      type: 'system' as const,
      title: '系统维护通知',
      message: '系统将于今晚 23:00 进行例行维护，预计耗时 2 小时',
      createdAt: '2024-03-25T09:00:00',
      read: true,
    },
    {
      id: 'notif-003',
      type: 'info' as const,
      title: 'AI 模型更新',
      message: 'AI 税务计算模型已更新至 v2.5，提升了转让定价分析准确率',
      createdAt: '2024-03-24T14:00:00',
      read: true,
    },
    {
      id: 'notif-004',
      type: 'info' as const,
      title: '新功能上线',
      message: '支持自动生成税务筹划建议报告，立即前往体验',
      createdAt: '2024-03-23T10:00:00',
      read: false,
      actionLabel: '去体验',
      actionPageId: 'cover-letter',
    },
  ],
}

// ============ 辅助函数：获取过滤后的数据 ============

export function getFilteredData(groupId: string | null, entityId: string | null) {
  // 过滤项目
  let filteredProjects = mockProjects
  if (entityId) {
    filteredProjects = mockProjects.filter(p => p.entityId === entityId)
  } else if (groupId) {
    filteredProjects = mockProjects.filter(p => p.groupId === groupId)
  }

  // 过滤最近访问
  let filteredRecentAccess = mockRecentAccess
  if (entityId) {
    filteredRecentAccess = mockRecentAccess.filter(r => r.entityId === entityId)
  } else if (groupId) {
    filteredRecentAccess = mockRecentAccess.filter(r => r.groupId === groupId)
  }

  // 过滤待办事项
  const filterTodos = (items: TodoItem[]) => {
    if (entityId) return items.filter(t => t.entityId === entityId)
    if (groupId) return items.filter(t => t.groupId === groupId)
    return items
  }

  const filteredTodos = {
    aiReview: filterTodos(mockTodos.aiReview),
    dataMissing: filterTodos(mockTodos.dataMissing),
    deadline: filterTodos(mockTodos.deadline),
    approval: filterTodos(mockTodos.approval),
  }

  // 过滤通知
  let filteredNotifications = {
    urgent: mockNotifications.urgent,
    system: mockNotifications.system,
  }
  if (entityId) {
    filteredNotifications = {
      urgent: mockNotifications.urgent.filter(n => !n.entityId || n.entityId === entityId),
      system: mockNotifications.system,
    }
  } else if (groupId) {
    filteredNotifications = {
      urgent: mockNotifications.urgent.filter(n => !n.groupId || n.groupId === groupId),
      system: mockNotifications.system,
    }
  }

  // 计算统计数据
  let stats = globalStats
  if (groupId && groupStats[groupId]) {
    const groupData = groupStats[groupId]
    if (entityId) {
      // 单个实体的统计
      stats = {
        activeProjects: filteredProjects.length,
        pendingTasks: filteredTodos.aiReview.filter(t => !t.completed).length +
                      filteredTodos.dataMissing.filter(t => !t.completed).length +
                      filteredTodos.deadline.filter(t => !t.completed).length +
                      filteredTodos.approval.filter(t => !t.completed).length,
        completedThisWeek: Math.floor(groupData.completedThisWeek / 2),
        aiProcessing: filteredProjects.filter(p => p.modules.aiParsing.status === 'error').length,
      }
    } else {
      stats = groupData
    }
  }

  return {
    stats,
    projects: filteredProjects,
    recentAccess: filteredRecentAccess,
    todos: filteredTodos,
    notifications: filteredNotifications,
  }
}

// 完整的 Dashboard 数据（默认全局）
export const mockDashboardData: DashboardData = {
  stats: globalStats,
  projects: mockProjects,
  recentAccess: mockRecentAccess,
  todos: mockTodos,
  notifications: mockNotifications,
}
