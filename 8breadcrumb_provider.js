import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BreadcrumbContext = createContext()

const BREADCRUMB_MAPPINGS = {
  '/dashboard': { title: 'Dashboard', icon: 'home' },
  '/academic-management': { title: 'Academic Management', icon: 'academic-cap' },
  '/academic-management/course-types': { title: 'Course Types', icon: 'tag' },
  '/academic-management/courses': { title: 'Courses', icon: 'book-open' },
  '/academic-management/modules': { title: 'Modules', icon: 'puzzle-piece' },
  '/academic-management/subjects': { title: 'Subjects', icon: 'document-text' },
  '/academic-management/sections': { title: 'Sections', icon: 'folder' },
  '/academic-management/topics': { title: 'Topics', icon: 'list-bullet' },
  '/infrastructure-management': { title: 'Infrastructure Management', icon: 'building-office' },
  '/infrastructure-management/batch-cycles': { title: 'Batch Cycles', icon: 'calendar' },
  '/infrastructure-management/premises': { title: 'Premises', icon: 'map-pin' },
  '/infrastructure-management/infrastructure': { title: 'Infrastructure', icon: 'building-library' },
  '/staff-management': { title: 'Staff Management', icon: 'users' },
  '/staff-management/staff': { title: 'Staff', icon: 'user-group' },
  '/staff-management/role-assignment': { title: 'Role Assignment', icon: 'identification' },
  '/staff-management/coordinator-assignment': { title: 'Coordinator Assignment', icon: 'user-plus' },
  '/student-operations': { title: 'Student Operations', icon: 'academic-cap' },
  '/student-operations/students': { title: 'Students', icon: 'user-group' },
  '/student-operations/course-groups': { title: 'Course Groups', icon: 'user-group' },
  '/scheduling-sessions': { title: 'Scheduling & Sessions', icon: 'calendar-days' },
  '/scheduling-sessions/schedule': { title: 'Schedule', icon: 'calendar' },
  '/scheduling-sessions/sessions': { title: 'Sessions', icon: 'video-camera' },
  '/scheduling-sessions/videos': { title: 'Recorded Videos', icon: 'film' },
  '/scheduling-sessions/timesheets': { title: 'Timesheets', icon: 'clock' },
  '/system-administration': { title: 'System Administration', icon: 'cog-6-tooth' },
  '/system-administration/menus': { title: 'Menu Management', icon: 'bars-3' },
  '/system-administration/role-menus': { title: 'Role-Based Menu', icon: 'key' },
  '/system-administration/settings': { title: 'System Settings', icon: 'adjustments-horizontal' },
  '/reports-documentation': { title: 'Reports & Documentation', icon: 'document-chart-bar' },
  '/reports-documentation/schedule-reports': { title: 'Schedule Reports', icon: 'chart-bar' },
  '/reports-documentation/certificates': { title: 'Student Certificates', icon: 'academic-cap' },
  '/reports-documentation/documents': { title: 'Document Management', icon: 'folder-open' },
  '/profile': { title: 'Profile', icon: 'user-circle' }
}

const createBreadcrumbFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ title: 'Home', path: '/dashboard', icon: 'home' }]
  
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const mapping = BREADCRUMB_MAPPINGS[currentPath]
    
    if (mapping) {
      breadcrumbs.push({
        title: mapping.title,
        path: currentPath,
        icon: mapping.icon
      })
    } else {
      // Handle dynamic segments or unmapped paths
      breadcrumbs.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        path: currentPath,
        icon: 'document'
      })
    }
  })
  
  return breadcrumbs
}

export const BreadcrumbProvider = ({ children }) => {
  const location = useLocation()
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState(null)

  const updateBreadcrumbsFromPath = useCallback(() => {
    if (customBreadcrumbs) return // Don't override custom breadcrumbs
    
    const pathBreadcrumbs = createBreadcrumbFromPath(location.pathname)
    setBreadcrumbs(pathBreadcrumbs)
  }, [location.pathname, customBreadcrumbs])

  const setCustomBreadcrumbTrail = useCallback((customTrail) => {
    if (!Array.isArray(customTrail)) {
      console.warn('Custom breadcrumb trail must be an array')
      return
    }
    
    setCustomBreadcrumbs(customTrail)
    setBreadcrumbs(customTrail)
  }, [])

  const clearCustomBreadcrumbs = useCallback(() => {
    setCustomBreadcrumbs(null)
    updateBreadcrumbsFromPath()
  }, [updateBreadcrumbsFromPath])

  const addBreadcrumb = useCallback((breadcrumb) => {
    if (!breadcrumb.title || !breadcrumb.path) {
      console.warn('Breadcrumb must have title and path properties')
      return
    }
    
    setBreadcrumbs(current => {
      const existingIndex = current.findIndex(b => b.path === breadcrumb.path)
      if (existingIndex !== -1) {
        // Update existing breadcrumb
        const updated = [...current]
        updated[existingIndex] = { ...updated[existingIndex], ...breadcrumb }
        return updated
      }
      // Add new breadcrumb
      return [...current, breadcrumb]
    })
  }, [])

  const removeBreadcrumb = useCallback((path) => {
    setBreadcrumbs(current => current.filter(b => b.path !== path))
  }, [])

  const updateBreadcrumb = useCallback((path, updates) => {
    setBreadcrumbs(current => 
      current.map(b => b.path === path ? { ...b, ...updates } : b)
    )
  }, [])

  const getBreadcrumbByPath = useCallback((path) => {
    return breadcrumbs.find(b => b.path === path)
  }, [breadcrumbs])

  const isCurrentPath = useCallback((path) => {
    return location.pathname === path
  }, [location.pathname])

  useEffect(() => {
    updateBreadcrumbsFromPath()
  }, [updateBreadcrumbsFromPath])

  const contextValue = {
    breadcrumbs,
    currentPath: location.pathname,
    setCustomBreadcrumbTrail,
    clearCustomBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    getBreadcrumbByPath,
    isCurrentPath,
    hasCustomBreadcrumbs: customBreadcrumbs !== null
  }

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  
  return context
}

export default BreadcrumbProvider