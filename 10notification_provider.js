import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const NotificationContext = createContext()

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
}

const DEFAULT_DURATION = {
  [NOTIFICATION_TYPES.SUCCESS]: 4000,
  [NOTIFICATION_TYPES.ERROR]: 6000,
  [NOTIFICATION_TYPES.WARNING]: 5000,
  [NOTIFICATION_TYPES.INFO]: 4000
}

const generateNotificationId = () => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const NotificationProvider = ({ 
  children,
  maxNotifications = 5,
  defaultPosition = NOTIFICATION_POSITIONS.TOP_RIGHT,
  globalDuration = null
}) => {
  const [notifications, setNotifications] = useState([])
  const timeoutsRef = useRef(new Map())

  const removeNotification = useCallback((id) => {
    setNotifications(current => current.filter(notification => notification.id !== id))
    
    // Clear timeout if it exists
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id))
      timeoutsRef.current.delete(id)
    }
  }, [])

  const clearAllNotifications = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current.clear()
    
    setNotifications([])
  }, [])

  const addNotification = useCallback((notification) => {
    const id = generateNotificationId()
    const duration = globalDuration || notification.duration || DEFAULT_DURATION[notification.type] || DEFAULT_DURATION.info
    
    const newNotification = {
      id,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      title: notification.title,
      message: notification.message,
      action: notification.action,
      persistent: notification.persistent || false,
      position: notification.position || defaultPosition,
      timestamp: new Date(),
      ...notification
    }

    setNotifications(current => {
      const updated = [newNotification, ...current]
      // Limit the number of notifications
      return updated.slice(0, maxNotifications)
    })

    // Set auto-remove timeout unless it's persistent
    if (!newNotification.persistent && duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(id)
      }, duration)
      
      timeoutsRef.current.set(id, timeoutId)
    }

    return id
  }, [defaultPosition, maxNotifications, globalDuration, removeNotification])

  const updateNotification = useCallback((id, updates) => {
    setNotifications(current => 
      current.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates, timestamp: new Date() }
          : notification
      )
    )
  }, [])

  const showSuccess = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      persistent: options.persistent !== undefined ? options.persistent : true,
      ...options
    })
  }, [addNotification])

  const showWarning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showInfo = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showNotification = useCallback((notification) => {
    return addNotification(notification)
  }, [addNotification])

  // Global error handler integration
  const handleGlobalError = useCallback((error, context = '') => {
    const errorMessage = error?.message || 'An unexpected error occurred'
    const errorTitle = context ? `Error in ${context}` : 'Application Error'
    
    showError(errorTitle, errorMessage, {
      persistent: true,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    })
  }, [showError])

  // API error handler
  const handleApiError = useCallback((error, operation = '') => {
    let title = 'Request Failed'
    let message = 'Unable to complete the operation. Please try again.'
    
    if (operation) {
      title = `${operation} Failed`
    }
    
    if (error?.response?.status) {
      const status = error.response.status
      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input and try again.'
          break
        case 401:
          title = 'Authentication Required'
          message = 'Please log in to continue.'
          break
        case 403:
          title = 'Access Denied'
          message = 'You do not have permission to perform this action.'
          break
        case 404:
          title = 'Not Found'
          message = 'The requested resource could not be found.'
          break
        case 422:
          title = 'Validation Error'
          message = error.response.data?.message || 'Please check your input and try again.'
          break
        case 500:
          title = 'Server Error'
          message = 'A server error occurred. Please try again later.'
          break
        default:
          message = error.response.data?.message || message
      }
    }
    
    showError(title, message)
  }, [showError])

  const getNotificationsByPosition = useCallback((position) => {
    return notifications.filter(notification => notification.position === position)
  }, [notifications])

  const hasNotifications = useCallback(() => {
    return notifications.length > 0
  }, [notifications])

  const getNotificationCount = useCallback(() => {
    return notifications.length
  }, [notifications])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    handleGlobalError,
    handleApiError,
    getNotificationsByPosition,
    hasNotifications,
    getNotificationCount,
    types: NOTIFICATION_TYPES,
    positions: NOTIFICATION_POSITIONS
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}

// Hook for simplified toast notifications
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification()
  
  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  }
}

// Higher-order component for error boundary integration
export const withErrorHandler = (Component) => {
  return (props) => {
    const { handleGlobalError } = useNotification()
    
    const handleError = (error, errorInfo) => {
      handleGlobalError(error, Component.name)
    }
    
    return <Component {...props} onError={handleError} />
  }
}

export default NotificationProvider