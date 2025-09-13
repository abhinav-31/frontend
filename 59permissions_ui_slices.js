// store/slices/permissionsSlice.js
import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'

// Entity adapter for normalized permission storage
const permissionsAdapter = createEntityAdapter({
  selectId: (permission) => permission.id || `${permission.resource}_${permission.action}`,
  sortComparer: (a, b) => a.resource.localeCompare(b.resource)
})

export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      
      if (!auth.isAuthenticated || !auth.user) {
        return rejectWithValue('User not authenticated')
      }

      const response = await fetch('/api/permissions/user', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const permissionsData = await response.json()
      return permissionsData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = permissionsAdapter.getInitialState({
  userRole: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  roleHierarchy: {
    ADMIN: 3,
    COURSE_COORDINATOR: 2,
    GENERAL_USER: 1
  },
  menuItems: [],
  accessibleRoutes: []
})

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action) => {
      const { permissions, role, menuItems = [] } = action.payload
      
      state.userRole = role
      state.menuItems = menuItems
      state.lastUpdated = Date.now()
      state.error = null
      
      // Normalize and store permissions
      permissionsAdapter.setAll(state, permissions)
      
      // Extract accessible routes from permissions
      state.accessibleRoutes = permissions
        .filter(p => p.allowed && p.menuPath)
        .map(p => p.menuPath)
    },
    
    clearPermissions: (state) => {
      state.userRole = null
      state.menuItems = []
      state.accessibleRoutes = []
      state.lastUpdated = null
      state.error = null
      permissionsAdapter.removeAll(state)
    },
    
    updatePermission: (state, action) => {
      const { permissionId, allowed } = action.payload
      permissionsAdapter.updateOne(state, {
        id: permissionId,
        changes: { allowed }
      })
    },
    
    addMenuException: (state, action) => {
      const { staffId, menuItem, allowed } = action.payload
      // Add logic for staff-specific menu exceptions
      const exceptionId = `${staffId}_${menuItem}`
      permissionsAdapter.upsertOne(state, {
        id: exceptionId,
        resource: menuItem,
        action: 'access',
        allowed,
        isException: true,
        staffId
      })
    },
    
    removeMenuException: (state, action) => {
      const { staffId, menuItem } = action.payload
      const exceptionId = `${staffId}_${menuItem}`
      permissionsAdapter.removeOne(state, exceptionId)
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false
        const { permissions, role, menuItems } = action.payload
        
        state.userRole = role
        state.menuItems = menuItems || []
        state.lastUpdated = Date.now()
        
        permissionsAdapter.setAll(state, permissions)
        
        state.accessibleRoutes = permissions
          .filter(p => p.allowed && p.menuPath)
          .map(p => p.menuPath)
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  setPermissions,
  clearPermissions,
  updatePermission,
  addMenuException,
  removeMenuException
} = permissionsSlice.actions

export default permissionsSlice.reducer

// store/slices/uiSlice.js
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    sidebarCollapsed: false,
    notifications: [],
    activeModal: null,
    loading: {
      global: false,
      dashboard: false,
      academic: false,
      infrastructure: false,
      staff: false,
      students: false,
      scheduling: false,
      reports: false
    },
    filters: {
      academic: {},
      staff: {},
      students: {},
      scheduling: {},
      reports: {}
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      itemsPerPage: 25,
      defaultView: 'grid'
    },
    recentSearches: [],
    bookmarkedItems: [],
    tourCompleted: {
      dashboard: false,
      academic: false,
      scheduling: false
    }
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    
    showNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    setActiveModal: (state, action) => {
      state.activeModal = action.payload
    },
    
    closeModal: (state) => {
      state.activeModal = null
    },
    
    setLoading: (state, action) => {
      const { section, isLoading } = action.payload
      if (section in state.loading) {
        state.loading[section] = isLoading
      } else {
        state.loading.global = isLoading
      }
    },
    
    setFilters: (state, action) => {
      const { section, filters } = action.payload
      if (section in state.filters) {
        state.filters[section] = { ...state.filters[section], ...filters }
      }
    },
    
    clearFilters: (state, action) => {
      const { section } = action.payload
      if (section in state.filters) {
        state.filters[section] = {}
      }
    },
    
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
      
      // Persist preferences to localStorage
      try {
        localStorage.setItem('ui-preferences', JSON.stringify(state.preferences))
      } catch (error) {
        console.warn('Failed to save preferences:', error)
      }
    },
    
    addRecentSearch: (state, action) => {
      const search = action.payload
      state.recentSearches = [
        search,
        ...state.recentSearches.filter(s => s.query !== search.query)
      ].slice(0, 10) // Keep only 10 recent searches
    },
    
    clearRecentSearches: (state) => {
      state.recentSearches = []
    },
    
    toggleBookmark: (state, action) => {
      const item = action.payload
      const existingIndex = state.bookmarkedItems.findIndex(b => b.id === item.id && b.type === item.type)
      
      if (existingIndex >= 0) {
        state.bookmarkedItems.splice(existingIndex, 1)
      } else {
        state.bookmarkedItems.unshift({
          ...item,
          bookmarkedAt: Date.now()
        })
        
        // Keep only 50 bookmarks
        if (state.bookmarkedItems.length > 50) {
          state.bookmarkedItems = state.bookmarkedItems.slice(0, 50)
        }
      }
    },
    
    markTourCompleted: (state, action) => {
      const { section } = action.payload
      if (section in state.tourCompleted) {
        state.tourCompleted[section] = true
      }
    },
    
    resetTours: (state) => {
      Object.keys(state.tourCompleted).forEach(key => {
        state.tourCompleted[key] = false
      })
    },
    
    initializeUI: (state, action) => {
      const { userRole } = action.payload
      
      // Load saved preferences
      try {
        const savedPreferences = localStorage.getItem('ui-preferences')
        if (savedPreferences) {
          state.preferences = { ...state.preferences, ...JSON.parse(savedPreferences) }
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error)
      }
      
      // Set role-specific defaults
      if (userRole === 'ADMIN') {
        state.preferences.defaultView = 'table'
        state.preferences.itemsPerPage = 50
      }
    },
    
    resetUI: (state) => {
      // Reset UI state but preserve some preferences
      const preservedPreferences = {
        theme: state.preferences.theme,
        language: state.preferences.language,
        timezone: state.preferences.timezone
      }
      
      return {
        ...initialState,
        preferences: { ...initialState.preferences, ...preservedPreferences }
      }
    }
  }
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  showNotification,
  removeNotification,
  clearNotifications,
  setActiveModal,
  closeModal,
  setLoading,
  setFilters,
  clearFilters,
  updatePreferences,
  addRecentSearch,
  clearRecentSearches,
  toggleBookmark,
  markTourCompleted,
  resetTours,
  initializeUI,
  resetUI
} = uiSlice.actions

export default uiSlice.reducer

// store/slices/breadcrumbSlice.js
export const breadcrumbSlice = createSlice({
  name: 'breadcrumb',
  initialState: {
    items: [],
    customTrail: null,
    autoGenerate: true
  },
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.items = action.payload
      state.customTrail = null
    },
    
    addBreadcrumb: (state, action) => {
      const breadcrumb = action.payload
      const existingIndex = state.items.findIndex(item => item.path === breadcrumb.path)
      
      if (existingIndex >= 0) {
        state.items[existingIndex] = breadcrumb
      } else {
        state.items.push(breadcrumb)
      }
    },
    
    removeBreadcrumb: (state, action) => {
      const path = action.payload
      state.items = state.items.filter(item => item.path !== path)
    },
    
    setCustomTrail: (state, action) => {
      state.customTrail = action.payload
      state.items = action.payload
    },
    
    clearCustomTrail: (state) => {
      state.customTrail = null
    },
    
    toggleAutoGenerate: (state) => {
      state.autoGenerate = !state.autoGenerate
    },
    
    generateFromPath: (state, action) => {
      const { pathname, mappings = {} } = action.payload
      
      if (!state.autoGenerate) return
      
      const segments = pathname.split('/').filter(Boolean)
      const breadcrumbs = [{ title: 'Home', path: '/dashboard', icon: 'home' }]
      
      let currentPath = ''
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const mapping = mappings[currentPath]
        
        if (mapping) {
          breadcrumbs.push({
            title: mapping.title,
            path: currentPath,
            icon: mapping.icon
          })
        } else {
          breadcrumbs.push({
            title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            path: currentPath,
            icon: 'document'
          })
        }
      })
      
      state.items = breadcrumbs
    }
  }
})

export const {
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  setCustomTrail,
  clearCustomTrail,
  toggleAutoGenerate,
  generateFromPath
} = breadcrumbSlice.actions

export default breadcrumbSlice.reducer