import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  sidebarCollapsed: boolean
}

export function PageLayout({ children, sidebarCollapsed }: PageLayoutProps) {
  return (
    <main
      className="min-h-screen bg-background transition-all duration-300"
      style={{
        marginLeft: sidebarCollapsed ? '5rem' : '18rem',
      }}
    >
      {children}
    </main>
  )
}
