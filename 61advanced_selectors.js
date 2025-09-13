// store/selectors/authSelectors.js
import { createSelector } from '@reduxjs/toolkit'

// Base selectors
export const selectAuthState = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading

// Memoized computed selectors
export const selectUserFullName = createSelector(
  [selectUser],
  (user) => {
    if (!user) return null
    return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }
)

export const selectUserInitials = createSelector(
  [selectUserFullName],
  (fullName) => {
    if (!fullName) return 'U'
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
)

export const selectIsSessionExpired = createSelector(
  [selectAuthState],
  (auth) => {
    if (!auth.sessionExpiry) return false
    return Date.now() > auth.sessionExpiry
  }
)

export const selectTimeUntilExpiry = createSelector(
  [selectAuthState],
  (auth) => {
    if (!auth.sessionExpiry) return null
    const timeLeft = auth.sessionExpiry - Date.now()
    return Math.max(0, timeLeft)
  }
)

export const selectIsAccountLocked = createSelector(
  [selectAuthState],
  (auth) => {
    if (!auth.isLocked) return false
    if (!auth.lockoutExpiry) return auth.isLocked
    return Date.now() < auth.lockoutExpiry
  }
)

// store/selectors/permissionSelectors.js
import { createSelector } from '@reduxjs/toolkit'

export const selectPermissionsState = (state) => state.permissions
export const selectUserRole = (state) => state.permissions.userRole
export const selectIsPermissionsLoading = (state) => state.permissions.isLoading
export const selectPermissionsError = (state) => state.permissions.error
export const selectRoleHierarchy = (state) => state.permissions.roleHierarchy
export const selectMenuItems = (state) => state.permissions.menuItems
export const selectAccessibleRoutes = (state) => state.permissions.accessibleRoutes

// Entity adapter selectors
export const permissionsAdapter = createEntityAdapter({
  selectId: (permission) => permission.id || `${permission.resource}_${permission.action}`,
  sortComparer: (a, b) => a.resource.localeCompare(b.resource)
})

export const {
  selectAll: selectAllPermissions,
  selectById: selectPermissionById,
  selectIds: selectPermissionIds,
  selectEntities: selectPermissionEntities
} = permissionsAdapter.getSelectors(selectPermissionsState)

// Complex computed selectors
export const selectPermissionsByResource = createSelector(
  [selectAllPermissions],
  (permissions) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    }, {})
  }
)

export const selectHasPermission = createSelector(
  [selectAllPermissions, selectUserRole, selectRoleHierarchy],
  (permissions, userRole, roleHierarchy) => {
    return (permission, targetRole = null) => {
      if (!userRole) return false
      
      // Admin has access to everything
      if (userRole === 'ADMIN') return true
      
      // Check role hierarchy if targetRole specified
      if (targetRole && roleHierarchy[userRole] < roleHierarchy[targetRole]) {
        return false
      }
      
      // Check specific permissions
      const userPermission = permissions.find(p => 
        p.resource === permission || 
        `${p.resource}_${p.action}` === permission
      )
      
      return userPermission ? userPermission.allowed : false
    }
  }
)

export const selectAccessibleMenuItemsByCategory = createSelector(
  [selectMenuItems],
  (menuItems) => {
    return menuItems.reduce((acc, item) => {
      const category = item.category || 'general'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {})
  }
)

export const selectIsRoleAtLeast = createSelector(
  [selectUserRole, selectRoleHierarchy],
  (userRole, roleHierarchy) => {
    return (minimumRole) => {
      if (!userRole) return false
      return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
    }
  }
)

// store/selectors/academicSelectors.js
export const selectCourseTypesState = (state) => state.academicApi
export const selectAcademicFilters = (state) => state.ui.filters.academic

// RTK Query result selectors with transformation
export const selectCourseTypesWithStats = createSelector(
  [
    (state) => academicApi.endpoints.getCourseTypes.select()(state),
    (state) => academicApi.endpoints.getCourses.select()(state)
  ],
  (courseTypesResult, coursesResult) => {
    const courseTypes = courseTypesResult.data || []
    const courses = coursesResult.data?.data || []
    
    return courseTypes.map(courseType => ({
      ...courseType,
      courseCount: courses.filter(course => course.courseTypeId === courseType.id).length,
      activeCoursesCount: courses.filter(course => 
        course.courseTypeId === courseType.id && course.status === 'active'
      ).length
    }))
  }
)

export const selectFilteredCourses = createSelector(
  [
    (state) => academicApi.endpoints.getCourses.select()(state),
    selectAcademicFilters
  ],
  (coursesResult, filters) => {
    const courses = coursesResult.data?.data || []
    
    return courses.filter(course => {
      // Apply batch cycle filter
      if (filters.batchCycle && course.batchCycleId !== filters.batchCycle) {
        return false
      }
      
      // Apply course type filter
      if (filters.courseType && course.courseTypeId !== filters.courseType) {
        return false
      }
      
      // Apply status filter
      if (filters.status && course.status !== filters.status) {
        return false
      }
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          course.title?.toLowerCase().includes(searchTerm) ||
          course.code?.toLowerCase().includes(searchTerm) ||
          course.description?.toLowerCase().includes(searchTerm)
        )
      }
      
      return true
    })
  }
)

export const selectCoursesGroupedByType = createSelector(
  [selectFilteredCourses, selectCourseTypesWithStats],
  (courses, courseTypes) => {
    return courseTypes.map(courseType => ({
      ...courseType,
      courses: courses.filter(course => course.courseTypeId === courseType.id)
    }))
  }
)

// store/selectors/uiSelectors.js
export const selectUIState = (state) => state.ui
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed
export const selectNotifications = (state) => state.ui.notifications
export const selectActiveModal = (state) => state.ui.activeModal
export const selectLoadingStates = (state) => state.ui.loading
export const selectPreferences = (state) => state.ui.preferences
export const selectRecentSearches = (state) => state.ui.recentSearches
export const selectBookmarkedItems = (state) => state.ui.bookmarkedItems

// Complex UI state selectors
export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => {
    return notifications.filter(notification => !notification.read)
  }
)

export const selectNotificationsByType = createSelector(
  [selectNotifications],
  (notifications) => {
    return notifications.reduce((acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = []
      }
      acc[notification.type].push(notification)
      return acc
    }, {})
  }
)

export const selectIsLoading = createSelector(
  [selectLoadingStates],
  (loadingStates) => {
    return (section) => {
      return section ? loadingStates[section] : loadingStates.global
    }
  }
)

export const selectBookmarksByType = createSelector(
  [selectBookmarkedItems],
  (bookmarks) => {
    return bookmarks.reduce((acc, bookmark) => {
      if (!acc[bookmark.type]) {
        acc[bookmark.type] = []
      }
      acc[bookmark.type].push(bookmark)
      return acc
    }, {})
  }
)

export const selectIsBookmarked = createSelector(
  [selectBookmarkedItems],
  (bookmarks) => {
    return (itemId, itemType) => {
      return bookmarks.some(bookmark => 
        bookmark.id === itemId && bookmark.type === itemType
      )
    }
  }
)

// store/selectors/index.js
export * from './authSelectors'
export * from './permissionSelectors'
export * from './academicSelectors'
export * from './uiSelectors'