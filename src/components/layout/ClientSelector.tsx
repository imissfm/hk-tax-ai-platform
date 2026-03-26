import { useState, useRef, useEffect } from 'react'
import {
  Building2,
  ChevronDown,
  Building,
  MapPin,
  CheckCircle2,
  Users,
  Globe,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Group, Entity } from '@/types/client'

// ============ 管辖区配置 ============
const jurisdictionConfig: Record<string, { name: string; color: string }> = {
  'HK': { name: '香港', color: 'text-warning' },
  'SG': { name: '新加坡', color: 'text-info' },
  'JP': { name: '日本', color: 'text-error' },
  'CN': { name: '中国', color: 'text-destructive' },
  'US': { name: '美国', color: 'text-primary' },
  'MY': { name: '马来西亚', color: 'text-secondary' },
  'TW': { name: '台湾', color: 'text-muted-foreground' },
  'GB': { name: '英国', color: 'text-primary' },
}

// ============ 组件 Props ============
interface ClientSelectorProps {
  groups: Group[]
  selectedGroupId: string | null
  onGroupChange: (groupId: string | null) => void
  entities: Entity[]
  selectedEntityId: string | null
  onEntityChange: (entityId: string | null) => void
}

export function ClientSelector({
  groups,
  selectedGroupId,
  onGroupChange,
  entities,
  selectedEntityId,
  onEntityChange,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'group' | 'entity'>('group')
  const ref = useRef<HTMLDivElement>(null)

  // 获取当前选中的集团
  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  // 获取当前集团下的实体
  const currentEntities = selectedGroupId
    ? entities.filter(e => e.groupId === selectedGroupId)
    : []

  // 获取当前选中的实体
  const selectedEntity = entities.find(e => e.id === selectedEntityId)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 获取管辖区显示
  const getJurisdictionDisplay = (code: string) => {
    const config = jurisdictionConfig[code] || { name: code, color: 'text-muted-foreground' }
    return (
      <span className={cn('text-xs', config.color)}>
        {config.name}
      </span>
    )
  }

  // 处理集团选择
  const handleGroupSelect = (groupId: string) => {
    onGroupChange(groupId)
    onEntityChange(null) // 清除实体选择
    setActiveTab('entity') // 切换到实体选择
  }

  // 处理实体选择
  const handleEntitySelect = (entityId: string) => {
    onEntityChange(entityId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg border transition-all',
          isOpen ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        )}
      >
        <Building2 className="w-5 h-5 text-primary" />
        <div className="text-left">
          <div className="text-xs text-muted-foreground">当前客户</div>
          <div className="font-medium">
            {selectedGroup ? (
              selectedEntity ? (
                <span>{selectedGroup.name} / {selectedEntity.name}</span>
              ) : (
                <span>{selectedGroup.name} (集团)</span>
              )
            ) : (
              <span className="text-muted-foreground">未选择</span>
            )}
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[400px] bg-card border border-border rounded-lg shadow-lg z-50">
          {/* 标签页 */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('group')}
              className={cn(
                'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                activeTab === 'group' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="w-4 h-4 inline-block mr-2" />
              集团
            </button>
            <button
              onClick={() => setActiveTab('entity')}
              disabled={!selectedGroupId}
              className={cn(
                'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                activeTab === 'entity' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground',
                !selectedGroupId && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Building className="w-4 h-4 inline-block mr-2" />
              实体
            </button>
          </div>

          {/* 内容区域 */}
          <div className="max-h-80 overflow-y-auto p-2">
            {activeTab === 'group' ? (
              // 集团列表
              <div className="space-y-1">
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all',
                      selectedGroupId === group.id
                        ? 'bg-primary/10 border border-primary/50'
                        : 'hover:bg-muted/50 border border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">{group.name}</span>
                      </div>
                      {selectedGroupId === group.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {group.pillarTwoStatus?.isApplicable ? (
                        <span className="text-success">Pillar Two 适用</span>
                      ) : (
                        <span>Pillar Two 不适用</span>
                      )}
                      <span className="mx-1">·</span>
                      <span>{group.pillarTwoStatus?.jurisdictions || 1} 个管辖区</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // 实体列表
              <div className="space-y-1">
                {currentEntities.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    请先选择集团
                  </div>
                ) : (
                  currentEntities.map(entity => (
                    <button
                      key={entity.id}
                      onClick={() => handleEntitySelect(entity.id)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-all',
                        selectedEntityId === entity.id
                          ? 'bg-primary/10 border border-primary/50'
                          : 'hover:bg-muted/50 border border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{entity.name}</span>
                        </div>
                        {selectedEntityId === entity.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {getJurisdictionDisplay(entity.jurisdiction.code)}
                        <span>·</span>
                        <span>税号: {entity.taxId}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 底部状态栏 */}
          <div className="border-t border-border p-3 bg-muted/30 rounded-b-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {selectedGroup && selectedEntity ? (
                  <span className="text-success">✓ 已选择: {selectedGroup.name} / {selectedEntity.name}</span>
                ) : selectedGroup ? (
                  <span>已选择集团，请选择实体</span>
                ) : (
                  <span>请选择集团</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
