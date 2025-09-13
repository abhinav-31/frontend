import { forwardRef } from 'react'
import { AlertCircle, Info, CheckCircle } from 'lucide-react'

const FormField = forwardRef(({
  children,
  label,
  description,
  error,
  helperText,
  success,
  required = false,
  optional = false,
  size = 'md',
  spacing = 'md',
  orientation = 'vertical',
  className = '',
  labelClassName = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        label: 'text-sm',
        description: 'text-xs',
        helper: 'text-xs'
      },
      md: {
        label: 'text-sm',
        description: 'text-sm',
        helper: 'text-sm'
      },
      lg: {
        label: 'text-base',
        description: 'text-sm',
        helper: 'text-sm'
      }
    }
    return sizes[size] || sizes.md
  }

  const getSpacingClasses = () => {
    const spacings = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3'
    }
    return spacings[spacing] || spacings.md
  }

  const getOrientationClasses = () => {
    if (orientation === 'horizontal') {
      return 'flex items-start space-x-4 space-y-0'
    }
    return 'flex flex-col'
  }

  const sizeConfig = getSizeClasses()

  const renderIcon = () => {
    if (error) {
      return <AlertCircle className="w-4 h-4 text-error-500 flex-shrink-0" />
    }
    if (success) {
      return <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
    }
    if (helperText) {
      return <Info className="w-4 h-4 text-primary-500 flex-shrink-0" />
    }
    return null
  }

  const renderMessage = () => {
    if (error) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          {renderIcon()}
          <p className={`text-error-600 dark:text-error-400 ${sizeConfig.helper}`}>
            {error}
          </p>
        </div>
      )
    }

    if (success) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          {renderIcon()}
          <p className={`text-success-600 dark:text-success-400 ${sizeConfig.helper}`}>
            {success}
          </p>
        </div>
      )
    }

    if (helperText) {
      return (
        <div className="flex items-start space-x-2 mt-1">
          {renderIcon()}
          <p className={`text-secondary-500 dark:text-secondary-400 ${sizeConfig.helper}`}>
            {helperText}
          </p>
        </div>
      )
    }

    return null
  }

  const baseClasses = [
    getOrientationClasses(),
    getSpacingClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {/* Label and Description Section */}
      {(label || description) && (
        <div className={orientation === 'horizontal' ? 'w-1/3 flex-shrink-0' : ''}>
          {label && (
            <label className={`block font-medium text-secondary-900 dark:text-secondary-100 ${sizeConfig.label} ${labelClassName}`}>
              {label}
              {required && (
                <span className="text-error-500 ml-1" aria-label="required">
                  *
                </span>
              )}
              {optional && (
                <span className="text-secondary-500 ml-1 font-normal">
                  (optional)
                </span>
              )}
            </label>
          )}
          
          {description && (
            <p className={`text-secondary-600 dark:text-secondary-400 ${sizeConfig.description} ${label ? 'mt-1' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Input Section */}
      <div className={orientation === 'horizontal' ? 'flex-1' : ''}>
        {children}
        {renderMessage()}
      </div>
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField

// Form Label Component (standalone)
export const FormLabel = forwardRef(({
  children,
  required = false,
  optional = false,
  size = 'md',
  className = '',
  htmlFor,
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-sm', 
      lg: 'text-base'
    }
    return sizes[size] || sizes.md
  }

  const baseClasses = [
    'block font-medium text-secondary-900 dark:text-secondary-100',
    getSizeClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <label 
      ref={ref}
      htmlFor={htmlFor}
      className={baseClasses} 
      {...props}
    >
      {children}
      {required && (
        <span className="text-error-500 ml-1" aria-label="required">
          *
        </span>
      )}
      {optional && (
        <span className="text-secondary-500 ml-1 font-normal">
          (optional)
        </span>
      )}
    </label>
  )
})

FormLabel.displayName = 'FormLabel'

// Form Error Message Component
export const FormError = forwardRef(({
  children,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm'
    }
    return sizes[size] || sizes.md
  }

  if (!children) return null

  const baseClasses = [
    'flex items-start space-x-2 mt-1',
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      <AlertCircle className="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5" />
      <p className={`text-error-600 dark:text-error-400 ${getSizeClasses()}`}>
        {children}
      </p>
    </div>
  )
})

FormError.displayName = 'FormError'

// Form Helper Text Component
export const FormHelperText = forwardRef(({
  children,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm'
    }
    return sizes[size] || sizes.md
  }

  const getVariantClasses = () => {
    const variants = {
      default: 'text-secondary-500 dark:text-secondary-400',
      success: 'text-success-600 dark:text-success-400',
      warning: 'text-warning-600 dark:text-warning-400'
    }
    return variants[variant] || variants.default
  }

  const getIcon = () => {
    if (variant === 'success') {
      return <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
    }
    return <Info className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
  }

  if (!children) return null

  const baseClasses = [
    'flex items-start space-x-2 mt-1',
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {getIcon()}
      <p className={`${getVariantClasses()} ${getSizeClasses()}`}>
        {children}
      </p>
    </div>
  )
})

FormHelperText.displayName = 'FormHelperText'

// Form Section Component for grouping related fields
export const FormSection = ({
  title,
  description,
  children,
  spacing = 'lg',
  className = '',
  ...props
}) => {
  const getSpacingClasses = () => {
    const spacings = {
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8'
    }
    return spacings[spacing] || spacings.lg
  }

  const baseClasses = [
    getSpacingClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={baseClasses} {...props}>
      {(title || description) && (
        <div className="border-b border-secondary-200 dark:border-secondary-700 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={getSpacingClasses()}>
        {children}
      </div>
    </div>
  )
}