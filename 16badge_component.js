import { forwardRef } from 'react'

const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  removable = false,
  onRemove,
  className = '',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
      secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200',
      error: 'bg-error-100 text-error-800 dark:bg-error-900/50 dark:text-error-200',
      info: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200',
      outline: 'bg-transparent border border-secondary-300 text-secondary-700 dark:border-secondary-600 dark:text-secondary-300',
      'outline-primary': 'bg-transparent border border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-300',
      'outline-success': 'bg-transparent border border-success-300 text-success-700 dark:border-success-600 dark:text-success-300',
      'outline-warning': 'bg-transparent border border-warning-300 text-warning-700 dark:border-warning-600 dark:text-warning-300',
      'outline-error': 'bg-transparent border border-error-300 text-error-700 dark:border-error-600 dark:text-error-300'
    }
    return variants[variant] || variants.default
  }

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm',
      xl: 'px-3.5 py-1 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getRoundedClasses = () => {
    const roundedOptions = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    }
    return roundedOptions[rounded] || roundedOptions.full
  }

  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-smooth',
    getSizeClasses(),
    getVariantClasses(),
    getRoundedClasses(),
    removable ? 'pr-1' : '',
    className
  ].filter(Boolean).join(' ')

  const handleRemove = (event) => {
    event.stopPropagation()
    onRemove?.(event)
  }

  const RemoveButton = () => (
    <button
      type="button"
      className="ml-1 -mr-0.5 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:bg-black/10 focus:outline-none transition-smooth dark:hover:bg-white/10 dark:focus:bg-white/10"
      onClick={handleRemove}
      aria-label="Remove badge"
    >
      <svg 
        className="h-3 w-3" 
        stroke="currentColor" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </button>
  )

  return (
    <span
      ref={ref}
      className={baseClasses}
      {...props}
    >
      <span className="truncate">{children}</span>
      {removable && <RemoveButton />}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge

// Status Badge Variants
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', children: 'Active' },
    inactive: { variant: 'secondary', children: 'Inactive' },
    pending: { variant: 'warning', children: 'Pending' },
    completed: { variant: 'success', children: 'Completed' },
    cancelled: { variant: 'error', children: 'Cancelled' },
    draft: { variant: 'secondary', children: 'Draft' },
    published: { variant: 'primary', children: 'Published' },
    archived: { variant: 'secondary', children: 'Archived' }
  }

  const config = statusConfig[status] || { variant: 'default', children: status }

  return <Badge {...config} {...props} />
}

// Notification Badge for counts
export const NotificationBadge = ({ count, max = 99, showZero = false, ...props }) => {
  const numericCount = parseInt(count, 10) || 0
  
  if (numericCount === 0 && !showZero) return null
  
  const displayCount = numericCount > max ? `${max}+` : numericCount.toString()
  
  return (
    <Badge
      variant="error"
      size="xs"
      className="min-w-5 h-5"
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

// Badge with dot indicator
export const DotBadge = ({ color = 'default', pulse = false, className = '', ...props }) => {
  const getDotColorClasses = () => {
    const colors = {
      default: 'bg-secondary-400',
      primary: 'bg-primary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500'
    }
    return colors[color] || colors.default
  }

  const dotClasses = [
    'w-2 h-2 rounded-full',
    getDotColorClasses(),
    pulse ? 'animate-pulse' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <div className={dotClasses} aria-hidden="true" />
      {props.children}
    </div>
  )
}