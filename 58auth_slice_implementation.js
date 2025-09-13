// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'

// Async thunks for authentication operations
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Check if user has valid session with BFF
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include session cookies
      })
      
      if (response.ok) {
        const userData = await response.json()
        return userData
      } else if (response.status === 401) {
        // No valid session, redirect to login
        window.location.href = '/api/auth/login'
        return rejectWithValue('No valid session')
      }
      
      throw new Error('Failed to initialize authentication')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call BFF logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Redirect to login page or home
        window.location.href = '/api/auth/login'
        return true
      }
      
      throw new Error('Logout failed')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastActivity: null,
  sessionExpiry: null,
  loginAttempts: 0,
  isLocked: false,
  lockoutExpiry: null
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload
      state.user = user
      state.isAuthenticated = true
      state.lastActivity = Date.now()
      state.error = null
      state.loginAttempts = 0
      state.isLocked = false
      state.lockoutExpiry = null
    },
    
    clearCredentials: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.lastActivity = null
      state.sessionExpiry = null
      state.error = null
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now()
    },
    
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload
    },
    
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1
      
      // Lock account after 5 failed attempts
      if (state.loginAttempts >= 5) {
        state.isLocked = true
        state.lockoutExpiry = Date.now() + (15 * 60 * 1000) // 15 minutes lockout
      }
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0
      state.isLocked = false
      state.lockoutExpiry = null
    },
    
    checkLockout: (state) => {
      if (state.isLocked && state.lockoutExpiry && Date.now() > state.lockoutExpiry) {
        state.isLocked = false
        state.lockoutExpiry = null
        state.loginAttempts = 0
      }
    },
    
    setAuthError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearAuthError: (state) => {
      state.error = null
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.lastActivity = Date.now()
        state.sessionExpiry = action.payload.sessionExpiry
        state.error = null
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        return initialState // Reset to initial state
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        // Still clear credentials on logout failure
        state.user = null
        state.isAuthenticated = false
      })
      
      // Handle API auth endpoints
      .addMatcher(
        authApi.endpoints.getUserProfile.matchFulfilled,
        (state, action) => {
          state.user = { ...state.user, ...action.payload }
        }
      )
      .addMatcher(
        authApi.endpoints.getUserProfile.matchRejected,
        (state, action) => {
          if (action.payload?.status === 401) {
            state.isAuthenticated = false
            state.user = null
          }
        }
      )
  }
})

export const {
  setCredentials,
  clearCredentials,
  updateLastActivity,
  setSessionExpiry,
  incrementLoginAttempts,
  resetLoginAttempts,
  checkLockout,
  setAuthError,
  clearAuthError
} = authSlice.actions

export default authSlice.reducer