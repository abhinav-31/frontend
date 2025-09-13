// store/index.js
export { default as store } from './store'
export * from './store'

// Export all slices
export * from './slices/authSlice'
export * from './slices/permissionsSlice'
export * from './slices/uiSlice'
export * from './slices/breadcrumbSlice'

// Export all APIs
export * from './api/authApi'
export * from './api/academicApi'
export * from './api/infrastructureApi'
export * from './api/staffApi'
export * from './api/studentsApi'
export * from './api/schedulingApi'
export * from './api/reportsApi'

// Export all selectors
export * from './selectors'

// Export middleware
export * from './middleware'
