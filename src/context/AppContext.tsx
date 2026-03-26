import React, { useState, useCallback, useMemo } from 'react'
import type { Group, Entity } from '@/types/client'
import { mockGroups, mockEntities } from '@/data/mockClientData'

// ============ Context 类型 ============
interface AppContextType {
  selectedGroupId: string | null
  selectedGroup: Group | null
  selectedEntityId: string | null
  selectedEntity: Entity | null
  groups: Group[]
  currentGroupEntities: Entity[]
  setSelectedGroup: (id: string | null) => void
  setSelectedEntity: (id: string | null) => void
}

// ============ 创建 Context ============
const AppContext = React.createContext<AppContextType | null>(null)

// ============ Provider ============
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const selectedGroup = selectedGroupId
    ? mockGroups.find(g => g.id === selectedGroupId) || null
    : null

  const selectedEntity = selectedEntityId
    ? mockEntities.find(e => e.id === selectedEntityId) || null
    : null

  const currentGroupEntities = selectedGroupId
    ? mockEntities.filter(e => e.groupId === selectedGroupId)
    : []

  const handleSetGroup = (id: string | null) => {
    setSelectedGroupId(id)
    setSelectedEntityId(null)
  }

  const value: AppContextType = {
    selectedGroupId,
    selectedGroup,
    selectedEntityId,
    selectedEntity,
    groups: mockGroups,
    currentGroupEntities,
    setSelectedGroup: handleSetGroup,
    setSelectedEntity: setSelectedEntityId,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ============ Hook ============
export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
