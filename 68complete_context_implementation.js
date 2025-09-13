// context/AuthContext.jsx - Enhanced Auth Context with Session Management
import { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth, updateLastActivity, logout } from '../store/slices/authSlice'
import { fetchUserPermissions } from '../store/slices/permissionsSlice'
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsLoading,
  selectIsAccountLocked,
  selectTimeUntilExpiry
} from '../store/selectors/authSelectors'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)
  const isAccountLocked = useSelector(selectIsAccountLocked)
  const timeUntilExpiry = useSelector(selectTimeUntilExpiry)

  useEffect(() => {
    // Initialize authentication on app start
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    // Fetch user permissions and initial data when authenticated
    if (isAuthenticated && user) {
      dispatch(fetchUserPermissions())
      
      // Fetch initial data for ADMIN role
      if (user.role === 'ADMIN') {
        // Dispatch actions to fetch all required data
        // This will be handled by the respective API calls when components mount
      }
    }
  }, [isAuthenticated, user, dispatch])

  // Session activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      const trackActivity = () => {
        dispatch(updateLastActivity())
      }

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      const throttledTrackActivity = throttle(trackActivity, 30000) // Throttle to 30 seconds

      events.forEach(event => {
        document.addEventListener(event, throttledTrackActivity, { passive: true })
      })

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, throttledTrackActivity)
        })
      }
    }
  }, [isAuthenticated, dispatch])

  // Session timeout warning
  useEffect(() => {
    if (timeUntilExpiry && timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes warning
      // Show session timeout warning
      console.warn('Session will expire in 5 minutes')
    }
    
    if (timeUntilExpiry && timeUntilExpiry <= 0) {
      dispatch(logout())
    }
  }, [timeUntilExpiry, dispatch])

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    isAccountLocked,
    timeUntilExpiry,
    login: () => {
      // Redirect to BFF login endpoint
      window.location.href = '/api/auth/login'
    },
    logout: () => dispatch(logout()),
    refreshAuth: () => dispatch(initializeAuth())
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility function for throttling
const throttle = (func, delay) => {
  let timeoutId
  let lastExecTime = 0
  return function (...args) {
    const currentTime = Date.now()
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

// context/BreadcrumbContext.jsx - Enhanced with Route-based Generation
import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  setBreadcrumbs, 
  addBreadcrumb, 
  removeBreadcrumb,
  setCustomTrail,
  clearCustomTrail,
  generateFromPath 
} from '../store/slices/breadcrumbSlice'

const BreadcrumbContext = createContext()

// Enhanced breadcrumb mappings based on your requirements
const BREADCRUMB_MAPPINGS = {
  '/dashboard': { title: 'Dashboard', icon: 'home' },
  
  // Academic Management
  '/academic-management': { title: 'Academic Management', icon: 'academic-cap' },
  '/academic-management/course-types': { title: 'Course Types', icon: 'tag' },
  '/academic-management/courses': { title: 'Courses', icon: 'book-open' },
  '/academic-management/modules': { title: 'Modules', icon: 'puzzle-piece' },
  '/academic-management/subjects': { title: 'Subjects', icon: 'document-text' },
  '/academic-management/sections': { title: 'Sections', icon: 'folder' },
  '/academic-management/topics': { title: 'Topics', icon: 'list-bullet' },
  
  // Infrastructure Management
  '/infrastructure-management': { title: 'Infrastructure Management', icon: 'building-office' },
  '/infrastructure-management/batch-cycles': { title: 'Batch Cycles', icon: 'calendar' },
  '/infrastructure-management/premises': { title: 'Premises', icon: 'map-pin' },
  '/infrastructure-management/infrastructure': { title: 'Infrastructure', icon: 'building-library' },
  
  // Staff Management
  '/staff-management': { title: 'Staff Management', icon: 'users' },
  '/staff-management/staff': { title: 'Staff', icon: 'user-group' },
  '/staff-management/course-groups': { title: 'Course Groups', icon: 'user-group' },
  '/staff-management/menu-items': { title: 'Menu Items', icon: 'bars-3' },
  '/staff-management/role-based-menu': { title: 'Role Based Menu', icon: 'key' },
  '/staff-management/course-assignment': { title: 'Course Assignment', icon: 'user-plus' },
  
  // Student Operations
  '/student-operations': { title: 'Student Operations', icon: 'academic-cap' },
  '/student-operations/students': { title: 'Students', icon: 'user-group' },
  
  // Scheduling & Sessions
  '/scheduling-sessions': { title: 'Scheduling & Sessions', icon: 'calendar-days' },
  '/scheduling-sessions/schedule': { title: 'Schedule', icon: 'calendar' },
  '/scheduling-sessions/sessions': { title: 'Online Sessions', icon: 'video-camera' },
  
  // System Administration
  '/system-administration': { title: 'System Administration', icon: 'cog-6-tooth' },
  
  // Reports & Documentation
  '/reports-documentation': { title: 'Reports & Documentation', icon: 'document-chart-bar' }
}

export const BreadcrumbProvider = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const breadcrumbs = useSelector(state => state.breadcrumb.items)
  const customTrail = useSelector(state => state.breadcrumb.customTrail)
  const autoGenerate = useSelector(state => state.breadcrumb.autoGenerate)

  // Auto-generate breadcrumbs from URL path
  useEffect(() => {
    if (autoGenerate && !customTrail) {
      dispatch(generateFromPath({ 
        pathname: location.pathname,
        mappings: BREADCRUMB_MAPPINGS 
      }))
    }
  }, [location.pathname, autoGenerate, customTrail, dispatch])

  const contextValue = {
    breadcrumbs,
    currentPath: location.pathname,
    setCustomBreadcrumbTrail: (trail) => dispatch(setCustomTrail(trail)),
    clearCustomBreadcrumbs: () => dispatch(clearCustomTrail()),
    addBreadcrumb: (breadcrumb) => dispatch(addBreadcrumb(breadcrumb)),
    removeBreadcrumb: (path) => dispatch(removeBreadcrumb(path)),
    isCurrentPath: (path) => location.pathname === path,
    hasCustomBreadcrumbs: customTrail !== null,
    mappings: BREADCRUMB_MAPPINGS
  }

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}

// context/PermissionContext.jsx - Enhanced Permission Management
import { createContext, useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  selectUserRole, 
  selectAllPermissions,
  selectHasPermission,
  selectAccessibleMenuItemsByCategory 
} from '../store/selectors/permissionSelectors'

const PermissionContext = createContext()

export const PermissionProvider = ({ children }) => {
  const userRole = useSelector(selectUserRole)
  const userPermissions = useSelector(selectAllPermissions)
  const isPermissionsLoaded = useSelector(state => !state.permissions.isLoading)
  const hasPermissionSelector = useSelector(selectHasPermission)
  const accessibleMenuItems = useSelector(selectAccessibleMenuItemsByCategory)

  const hasPermission = (permission, targetRole = null) => {
    return hasPermissionSelector(permission, targetRole)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  const canAccessRoute = (routePath) => {
    const routePermissionMap = {
      '/dashboard': 'dashboard.view',
      '/academic-management': 'academic-management.view',
      '/infrastructure-management': 'infrastructure-management.view',
      '/staff-management': 'staff-management.view',
      '/student-operations': 'student-operations.view',
      '/scheduling-sessions': 'scheduling-sessions.view',
      '/system-administration': 'system-administration.view',
      '/reports-documentation': 'reports-documentation.view'
    }
    
    const permission = routePermissionMap[routePath]
    return permission ? hasPermission(permission) : false
  }

  const getAccessibleMenuItems = () => {
    return Object.values(accessibleMenuItems).flat()
  }

  const isRoleAtLeast = (minimumRole) => {
    const roleHierarchy = {
      ADMIN: 3,
      COURSE_COORDINATOR: 2,
      GENERAL_USER: 1
    }
    
    if (!userRole) return false
    return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
  }

  const contextValue = {
    userRole,
    userPermissions,
    isPermissionsLoaded,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    getAccessibleMenuItems,
    isRoleAtLeast,
    accessibleMenuItems,
    roles: {
      ADMIN: 'ADMIN',
      COURSE_COORDINATOR: 'COURSE_COORDINATOR',
      GENERAL_USER: 'GENERAL_USER'
    }
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermission = () => {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}

// HOC for permission-based rendering
export const withPermission = (permission) => (Component) => {
  return (props) => {
    const { hasPermission } = usePermission()
    
    if (!hasPermission(permission)) {
      return null
    }
    
    return <Component {...props} />
  }
}

// Component for conditional rendering based on permissions
export const PermissionGuard = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  fallback = null, 
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
  
  let hasAccess = false
  
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }
  
  return hasAccess ? children : fallback
}