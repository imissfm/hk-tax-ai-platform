import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageLayout } from '@/components/layout/PageLayout'
import { DataUploadPage } from '@/pages/DataUploadPage'
import { PillarTwoPage } from '@/pages/PillarTwoPage'
import { ProfitsTaxPage } from '@/pages/ProfitsTaxPage'
import { ReturnFillingPage } from '@/pages/ReturnFillingPage'
import { CoverLetterPage } from '@/pages/CoverLetterPage'
import { ExportPage } from '@/pages/ExportPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/context/AppContext'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'upload':
        return <DataUploadPage />
      case 'pillar-two':
        return <PillarTwoPage />
      case 'profits-tax':
        return <ProfitsTaxPage />
      case 'return-filling':
        return <ReturnFillingPage />
      case 'cover-letter':
        return <CoverLetterPage />
      case 'export':
        return <ExportPage />
      default:
        return <DashboardPage onNavigate={handleNavigate} />
    }
  }

  return (
    <AppProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
          />
          <PageLayout sidebarCollapsed={sidebarCollapsed}>
            {renderPage()}
          </PageLayout>
        </div>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App
