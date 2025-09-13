import { forwardRef } from 'react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white border-transparent',
      secondary: 'bg-secondary-100 hover:bg-secondary-200 focus:ring-secondary-500 text-secondary-900 border-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-100 dark:border-secondary-700',
      outline: 'bg-transparent hover:bg-primary-50 focus:ring-primary-500 text-primary-600 border-primary-300 dark:hover:bg-primary-900/10 dark:text-primary-400 dark:border-primary-600',
      ghost: 'bg-transparent hover:bg-secondary-100 focus:ring-secondary-500 text-secondary-700 border-transparent dark:hover:bg-secondary-800 dark:text-secondary-300',
      success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white border-transparent',
      warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500 text-white border-transparent',
      error: 'bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white border-transparent',
      link: 'bg-transparent hover:bg-transparent focus:ring-primary-500 text-primary-600 border-transparent p-0 h-auto underline hover:no-underline dark:text-primary-400'
    }
    return variants[variant] || variants.primary
  }

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getDisabledClasses = () => {
    if (!disabled && !loading) return ''
    return 'opacity-50 cursor-not-allowed pointer-events-none'
  }

  const getFullWidthClasses = () => {
    return fullWidth ? 'w-full' : ''
  }

  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-md',
    'border transition-smooth',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'active:scale-95',
    getSizeClasses(),
    getVariantClasses(),
    getDisabledClasses(),
    getFullWidthClasses(),
    className
  ].filter(Boolean).join(' ')

  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <span className="mr-2 -ml-1" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="ml-2 -mr-1" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button