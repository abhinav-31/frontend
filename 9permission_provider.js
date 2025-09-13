import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserPermissions, selectUserPermissions, selectUserRole } from '../store/slices/permissionsSlice'

const PermissionContext = createContext()

const USER_ROLES = {
  ADMIN: 'ADMIN',
  COURSE_COORDINATOR: 'COURSE_COORDINATOR', 
  GENERAL_USER: 'GENERAL_USER'
}

const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.COURSE_COORDINATOR]: 2,
  [USER_ROLES.GENERAL_USER]: 1
}

const DEFAULT_PERMISSIONS = {
  // Academic Management
  'academic-management.view': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR, USER_ROLES.GENERAL_USER],
  'academic-management.course-types.create': [USER_ROLES.ADMIN],
  'academic-management.course-types.update': [USER_ROLES.ADMIN],
  'academic-management.course-types.delete': [USER_ROLES.ADMIN],
  'academic-management.courses.create': [USER_ROLES.ADMIN],
  'academic-management.courses.update': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'academic-management.courses.delete': [USER_ROLES.ADMIN],
  'academic-management.modules.create': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'academic-management.modules.update': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'academic-management.modules.delete': [USER_ROLES.ADMIN],
  'academic-management.subjects.create': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'academic-management.subjects.update': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'academic-management.subjects.delete': [USER_ROLES.ADMIN],
  
  // Infrastructure Management
  'infrastructure-management.view': [USER_ROLES.ADMIN],
  'infrastructure-management.batch-cycles.create': [USER_ROLES.ADMIN],
  'infrastructure-management.premises.create': [USER_ROLES.ADMIN],
  'infrastructure-management.infrastructure.create': [USER_ROLES.ADMIN],
  
  // Staff Management
  'staff-management.view': [USER_ROLES.ADMIN],
  'staff-management.staff.create': [USER_ROLES.ADMIN],
  'staff-management.role-assignment.create': [USER_ROLES.ADMIN],
  
  // Student Operations
  'student-operations.view': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'student-operations.students.import': [USER_ROLES.COURSE_COORDINATOR],
  'student-operations.course-groups.create': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  
  // Scheduling & Sessions
  'scheduling-sessions.view': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR, USER_ROLES.GENERAL_USER],
  'scheduling-sessions.schedule.create': [USER_ROLES.COURSE_COORDINATOR],
  'scheduling-sessions.sessions.create': [USER_ROLES.COURSE_COORDINATOR, USER_ROLES.GENERAL_USER],
  'scheduling-sessions.videos.create': [USER_ROLES.COURSE_COORDINATOR, USER_ROLES.GENERAL_USER],
  'scheduling-sessions.timesheets.create': [USER_ROLES.GENERAL_USER],
  'scheduling-sessions.timesheets.approve': [USER_ROLES.COURSE_COORDINATOR],
  
  // System Administration
  'system-administration.view': [USER_ROLES.ADMIN],
  'system-administration.menus.create': [USER_ROLES.ADMIN],
  'system-administration.role-menus.create': [USER_ROLES.ADMIN],
  
  // Reports & Documentation
  'reports-documentation.view': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR],
  'reports-documentation.schedule-reports.generate': [USER_ROLES.COURSE_COORDINATOR],
  'reports-documentation.certificates.generate': [USER_ROLES.ADMIN, USER_ROLES.COURSE_COORDINATOR]
}

export const PermissionProvider = ({ children }) => {
  const dispatch = useDispatch()
  const userRole = useSelector(selectUserRole)
  const userPermissions = useSelector(selectUserPermissions)
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false)

  const hasPermission = useCallback((permission, targetRole = null) => {
    // If no user role is set, deny access
    if (!userRole) return false
    
    // Admin has access to everything
    if (userRole === USER_ROLES.ADMIN) return true
    
    // Check role hierarchy if targetRole is specified
    if (targetRole && ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[targetRole]) {
      return false
    }
    
    // Check specific permissions from backend (RoleBasedMenu + StaffMenuAccess)
    if (userPermissions && userPermissions.length > 0) {
      const hasSpecificPermission = userPermissions.some(p => 
        p.permission === permission && p.allowed === true
      )
      
      // Check for explicit denial in StaffMenuAccess (exception list)
      const isExplicitlyDenied = userPermissions.some(p => 
        p.permission === permission && p.allowed === false && p.isException === true
      )
      
      if (isExplicitlyDenied) return false
      if (hasSpecificPermission) return true
    }
    
    // Fallback to default role-based permissions
    const allowedRoles = DEFAULT_PERMISSIONS[permission]
    return allowedRoles ? allowedRoles.includes(userRole) : false
  }, [userRole, userPermissions])

  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }, [hasPermission])

  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }, [hasPermission])

  const canAccessRoute = useCallback((routePath) => {
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
  }, [hasPermission])

  const getAccessibleMenuItems = useCallback(() => {
    if (!userPermissions || !isPermissionsLoaded) return []
    
    return userPermissions
      .filter(p => p.allowed === true)
      .map(p => ({
        path: p.menuPath,
        title: p.menuTitle,
        icon: p.menuIcon,
        permission: p.permission
      }))
  }, [userPermissions, isPermissionsLoaded])

  const isRoleAtLeast = useCallback((minimumRole) => {
    if (!userRole) return false
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
  }, [userRole])

  const getRoleLevel = useCallback(() => {
    return userRole ? ROLE_HIERARCHY[userRole] : 0
  }, [userRole])

  const refreshPermissions = useCallback(async () => {
    if (userRole) {
      setIsPermissionsLoaded(false)
      try {
        await dispatch(fetchUserPermissions()).unwrap()
      } catch (error) {
        console.error('Failed to refresh permissions:', error)
      } finally {
        setIsPermissionsLoaded(true)
      }
    }
  }, [dispatch, userRole])

  useEffect(() => {
    if (userRole && !isPermissionsLoaded) {
      refreshPermissions()
    }
  }, [userRole, isPermissionsLoaded, refreshPermissions])

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
    getRoleLevel,
    refreshPermissions,
    roles: USER_ROLES,
    roleHierarchy: ROLE_HIERARCHY
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermission = () => {
  const context = useContext(PermissionContext)
  
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  
  return context
}

// Higher-order component for permission-based rendering
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

export default PermissionProvider