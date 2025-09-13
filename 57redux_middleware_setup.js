// store/middleware/authMiddleware.js
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'
import { logout, setCredentials, clearCredentials } from '../slices/authSlice'
import { clearPermissions } from '../slices/permissionsSlice'
import { resetUI } from '../slices/uiSlice'

export const authMiddleware = createListenerMiddleware()

// Handle successful login
authMiddleware.startListening({
  matcher: authApi.endpoints.login.matchFulfilled,
  effect: async (action, listenerApi) => {
    const { user, permissions } = action.payload
    
    // Set user credentials in auth slice
    listenerApi.dispatch(setCredentials({ user }))
    
    // Set user permissions
    listenerApi.dispatch(setPermissions({ permissions }))
    
    // Initialize UI state for the user
    listenerApi.dispatch(initializeUI({ userRole: user.role }))
  }
})

// Handle logout
authMiddleware.startListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    // Clear all user-related state
    listenerApi.dispatch(clearCredentials())
    listenerApi.dispatch(clearPermissions())
    listenerApi.dispatch(resetUI())
    
    // Clear any cached data
    listenerApi.dispatch(authApi.util.resetApiState())
  }
})

// Handle token refresh
authMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchFulfilled,
  effect: async (action, listenerApi) => {
    const { user } = action.payload
    listenerApi.dispatch(setCredentials({ user }))
  }
})

// Handle authentication errors
authMiddleware.startListening({
  matcher: isAnyOf(
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.refreshToken.matchRejected
  ),
  effect: async (action, listenerApi) => {
    // If authentication fails, clear credentials
    if (action.payload?.status === 401) {
      listenerApi.dispatch(logout())
    }
  }
})

// store/middleware/errorMiddleware.js
export const errorMiddleware = createListenerMiddleware()

// Global error handler for API failures
errorMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected') && action.payload?.status
  },
  effect: async (action, listenerApi) => {
    const { status, data } = action.payload
    const state = listenerApi.getState()
    
    // Handle different HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - trigger logout
        if (state.auth.isAuthenticated) {
          listenerApi.dispatch(logout())
        }
        break
        
      case 403:
        // Forbidden - show permission error
        listenerApi.dispatch(
          showNotification({
            type: 'error',
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
          })
        )
        break
        
      case 422:
        // Validation error - show validation messages
        if (data?.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            listenerApi.dispatch(
              showNotification({
                type: 'error',
                title: 'Validation Error',
                message: `${field}: ${messages.join(', ')}`,
              })
            )
          })
        }
        break
        
      case 500:
        // Server error
        listenerApi.dispatch(
          showNotification({
            type: 'error',
            title: 'Server Error',
            message: 'An unexpected server error occurred. Please try again later.',
          })
        )
        break
        
      default:
        // Generic error
        listenerApi.dispatch(
          showNotification({
            type: 'error',
            title: 'Request Failed',
            message: data?.message || 'An unexpected error occurred.',
          })
        )
    }
  }
})

// store/middleware/cacheMiddleware.js
export const cacheMiddleware = createListenerMiddleware()

// Cache management for offline support
cacheMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled') && action.meta?.arg?.originalArgs
  },
  effect: async (action, listenerApi) => {
    const { endpointName, originalArgs } = action.meta.arg
    
    // Cache certain queries for offline access
    const cacheableEndpoints = [
      'getCourseTypes',
      'getCourses',
      'getModules',
      'getBatchCycles',
      'getStaff'
    ]
    
    if (cacheableEndpoints.includes(endpointName)) {
      try {
        const cacheKey = `${endpointName}_${JSON.stringify(originalArgs)}`
        const cacheData = {
          data: action.payload,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutes TTL
        }
        
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('Failed to cache data:', error)
      }
    }
  }
})

// Clean expired cache entries
cacheMiddleware.startListening({
  actionCreator: 'cache/cleanup',
  effect: async () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      const now = Date.now()
      
      keys.forEach(key => {
        try {
          const cached = JSON.parse(localStorage.getItem(key))
          if (cached && cached.timestamp + cached.ttl < now) {
            localStorage.removeItem(key)
          }
        } catch {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to cleanup cache:', error)
    }
  }
})

// store/middleware/index.js
export { authMiddleware } from './authMiddleware'
export { errorMiddleware } from './errorMiddleware'
export { cacheMiddleware } from './cacheMiddleware'