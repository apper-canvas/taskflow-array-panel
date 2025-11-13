import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/organisms/Sidebar"
import Header from "@/components/organisms/Header"
import { useAuth } from "@/layouts/Root"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const { isAuthenticated } = useAuth()

  // Redirect if not authenticated - handled by route guards
  if (!isAuthenticated) {
    return null;
  }

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleQuickAdd = () => {
    setShowQuickAdd(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleCloseSidebar}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={handleMenuClick}
            onQuickAdd={handleQuickAdd}
/>
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Outlet context={{ showQuickAdd, setShowQuickAdd }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout