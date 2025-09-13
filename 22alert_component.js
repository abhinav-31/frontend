import { forwardRef, useState } from 'react'

const Alert = forwardRef(({
  children,
  variant = 'info',
  size = 'md',
  title,
  description,
  dismissible = false,
  onDismiss,
  icon,
  actions,
  className = '',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(true)

  const getVariantClasses = () => {
    const variants = {
      info: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/10 dark:border-primary-800 dark:text-primary-200',
      success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/10 dark:border-success-800 dark:text-success-200',
      warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/10 dark:border-warning-800 dark:text-warning-200',
      error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/10 dark:border-error-800 dark:text-error-200'
    }
    return variants[variant] || variants.info
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'p-3 text-sm',
      md: 'p-4 text-sm',
      lg: 'p-6 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getDefaultIcon = () => {
    const icons = {
      info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
    return icons[variant] || icons.info
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const DismissButton = () => (
    <button
      type="button"
      onClick={handleDismiss}
      className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-smooth hover:bg-black/5 focus:ring-current"
      aria-label="Dismiss alert"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  )

  if (!isVisible) return null

  const baseClasses = [
    'border rounded-lg',
    getVariantClasses(),
    getSizeClasses(),
    className
  ].filter(Boolean).join(' ')

  const iconComponent = icon || getDefaultIcon()

  return (
    <div
      ref={ref}
      className={baseClasses}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start">
        {iconComponent && (
          <div className="flex-shrink-0 mr-3">
            {iconComponent}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-medium mb-1">
              {title}
            </h3>
          )}
          
          {description && (
            <div className="mb-2">
              {description}
            </div>
          )}
          
          {children && (
            <div>
              {children}
            </div>
          )}
          
          {actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
        
        {dismissible && (
          <div className="flex-shrink-0 ml-3">
            <DismissButton />
          </div>
        )}
      </div>
    </div>
  )
})

Alert.displayName = 'Alert'

export default Alert

// Predefined Alert Variants
export const InfoAlert = ({ ...props }) => (
  <Alert variant="info" {...props} />
)

export const SuccessAlert = ({ ...props }) => (
  <Alert variant="success" {...props} />
)

export const WarningAlert = ({ ...props }) => (
  <Alert variant="warning" {...props} />
)

export const ErrorAlert = ({ ...props }) => (
  <Alert variant="error" {...props} />
)