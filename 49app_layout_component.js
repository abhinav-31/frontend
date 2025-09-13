// components/layout/AppLayout/AppLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'
import { Footer } from '../Footer'
import { MainContent } from '../MainContent'
import { useTheme, usePermission, useBreadcrumb } from '../../../providers'
import { LoadingSpinner } from '../../common/Feedback'
import { ErrorBoundary } from '../../common/ErrorBoundary'

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const dispatch = useDispatch()
  const { isDarkMode } = useTheme()
  const { isPermissionsLoaded } = usePermission()
  const { breadcrumbs } = useBreadcrumb()
  
  // Global loading and authentication states
  const isLoading = useSelector(state => state.auth.isLoading)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const userProfile = useSelector(state => state.auth.user)

  // Responsive sidebar management
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      
      if (isMobile) {
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      } else if (isTablet) {
        setSidebarOpen(false)
        setSidebarCollapsed(true)
      } else {
        setSidebarOpen(true)
        setSidebarCollapsed(false)
      }
    }

    // Set initial state
    handleResize()
    
    // Listen for window resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle sidebar toggle for mobile
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Handle sidebar collapse for desktop
  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Handle backdrop click on mobile
  const handleBackdropClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  // Show loading screen during authentication check
  if (isLoading || !isPermissionsLoaded) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text="Loading application..." 
        />
      </div>
    )
  }

  // Redirect to login if not authenticated (handled by route guards)
  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-secondary-50 dark:bg-secondary-900 ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="relative">
            {/* Mobile backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                onClick={handleBackdropClick}
              />
            )}
            
            {/* Sidebar component */}
            <div className={`
              fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
              md:relative md:translate-x-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
            `}>
              <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
                onCollapse={handleSidebarCollapse}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header
              onSidebarToggle={handleSidebarToggle}
              sidebarOpen={sidebarOpen}
              user={userProfile}
            />

            {/* Main content */}
            <MainContent breadcrumbs={breadcrumbs}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </MainContent>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AppLayout