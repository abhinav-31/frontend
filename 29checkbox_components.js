import { forwardRef } from 'react'
import { Check, Minus, AlertCircle } from 'lucide-react'

const Checkbox = forwardRef(({
  label,
  description,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  indeterminate = false,
  colorScheme = 'primary',
  className = '',
  containerClassName = '',
  labelClassName = '',
  onChange,
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        checkbox: 'h-4 w-4',
        icon: 'w-3 h-3',
        label: 'text-sm',
        description: 'text-xs'
      },
      md: {
        checkbox: 'h-5 w-5',
        icon: 'w-3.5 h-3.5',
        label: 'text-sm',
        description: 'text-sm'
      },
      lg: {
        checkbox: 'h-6 w-6',
        icon: 'w-4 h-4',
        label: 'text-base',
        description: 'text-sm'
      }
    }
    return sizes[size] || sizes.md
  }

  const getColorSchemeClasses = () => {
    const schemes = {
      primary: {
        checked: 'bg-primary-600 border-primary-600 text-white',
        unchecked: 'border-secondary-300 bg-white dark:border-secondary-600 dark:bg-secondary-900',
        focus: 'focus:ring-primary-500'
      },
      success: {
        checked: 'bg-success-600 border-success-600 text-white',
        unchecked: 'border-secondary-300 bg-white dark:border-secondary-600 dark:bg-secondary-900',
        focus: 'focus:ring-success-500'
      },
      warning: {
        checked: 'bg-warning-600 border-warning-600 text-white',
        unchecked: 'border-secondary-300 bg-white dark:border-secondary-600 dark:bg-secondary-900',
        focus: 'focus:ring-warning-500'
      },
      error: {
        checked: 'bg-error-600 border-error-600 text-white',
        unchecked: 'border-secondary-300 bg-white dark:border-secondary-600 dark:bg-secondary-900',
        focus: 'focus:ring-error-500'
      }
    }
    return schemes[colorScheme] || schemes.primary
  }

  const getVariantClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed'
    }

    if (error) {
      return 'border-error-300 focus:border-error-500 focus:ring-error-500'
    }

    const colorScheme = getColorSchemeClasses()
    return `${colorScheme.unchecked} ${colorScheme.focus}`
  }

  const sizeConfig = getSizeClasses()
  const colorConfig = getColorSchemeClasses()

  const baseClasses = [
    'rounded border-2 transition-smooth',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeConfig.checkbox,
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ')

  const handleChange = (event) => {
    if (disabled) return
    onChange?.(event)
  }

  return (
    <div className={`flex items-start ${containerClassName}`}>
      <div className="flex items-center h-5">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className={`${baseClasses} peer`}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            {...props}
          />
          
          {/* Custom checkbox appearance */}
          <div className={`
            absolute inset-0 flex items-center justify-center pointer-events-none
            peer-checked:${colorConfig.checked}
            ${props.checked || indeterminate ? colorConfig.checked : 'opacity-0'}
          `}>
            {indeterminate ? (
              <Minus className={`${sizeConfig.icon} text-current`} />
            ) : (
              <Check className={`${sizeConfig.icon} text-current`} />
            )}
          </div>
        </div>
      </div>
      
      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <label 
              className={`font-medium text-secondary-900 dark:text-secondary-100 ${sizeConfig.label} ${labelClassName} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              onClick={(e) => {
                if (!disabled && ref?.current) {
                  ref.current.click()
                }
              }}
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}
          
          {description && (
            <p className={`text-secondary-600 dark:text-secondary-400 mt-1 ${sizeConfig.description} ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
      
      {error && (
        <div className="ml-2 flex items-center">
          <AlertCircle className="w-4 h-4 text-error-500" />
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox

// Checkbox Group Component
export const CheckboxGroup = ({
  children,
  label,
  description,
  error,
  helperText,
  required = false,
  orientation = 'vertical',
  spacing = 'md',
  className = '',
  ...props
}) => {
  const getOrientationClasses = () => {
    const orientations = {
      vertical: 'flex-col',
      horizontal: 'flex-row flex-wrap'
    }
    return orientations[orientation] || orientations.vertical
  }

  const getSpacingClasses = () => {
    const spacings = {
      sm: orientation === 'vertical' ? 'space-y-2' : 'space-x-4',
      md: orientation === 'vertical' ? 'space-y-3' : 'space-x-6',
      lg: orientation === 'vertical' ? 'space-y-4' : 'space-x-8'
    }
    return spacings[spacing] || spacings.md
  }

  return (
    <fieldset className={className} {...props}>
      {label && (
        <legend className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-3">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
          {description}
        </p>
      )}
      
      <div className={`flex ${getOrientationClasses()} ${getSpacingClasses()}`}>
        {children}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          {helperText}
        </p>
      )}
    </fieldset>
  )
}

// Switch Component (Toggle)
export const Switch = forwardRef(({
  label,
  description,
  error,
  size = 'md',
  disabled = false,
  colorScheme = 'primary',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4'
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5'
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: 'translate-x-7'
      }
    }
    return sizes[size] || sizes.md
  }

  const getColorSchemeClasses = () => {
    const schemes = {
      primary: 'peer-checked:bg-primary-600 peer-focus:ring-primary-500',
      success: 'peer-checked:bg-success-600 peer-focus:ring-success-500',
      warning: 'peer-checked:bg-warning-600 peer-focus:ring-warning-500',
      error: 'peer-checked:bg-error-600 peer-focus:ring-error-500'
    }
    return schemes[colorScheme] || schemes.primary
  }

  const sizeConfig = getSizeClasses()
  const colorConfig = getColorSchemeClasses()

  return (
    <div className={`flex items-center justify-between ${containerClassName}`}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className={`text-sm font-medium text-secondary-900 dark:text-secondary-100 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              {label}
            </label>
          )}
          {description && (
            <p className={`text-sm text-secondary-600 dark:text-secondary-400 ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        <input
          ref={ref}
          type="checkbox"
          className="sr-only peer"
          disabled={disabled}
          {...props}
        />
        <div className={`
          ${sizeConfig.track} 
          bg-secondary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 
          rounded-full peer dark:bg-secondary-700 
          ${colorConfig}
          transition-all duration-200
        `}>
          <div className={`
            ${sizeConfig.thumb} 
            bg-white rounded-full shadow-lg transform transition-transform duration-200 
            peer-checked:${sizeConfig.translate}
            absolute top-0.5 left-0.5
          `} />
        </div>
      </label>
    </div>
  )
})

Switch.displayName = 'Switch'