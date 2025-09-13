import { forwardRef } from 'react'

const Skeleton = forwardRef(function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
  rounded = 'md',
  children,
  ...props
}, ref) {
  const getVariantClasses = () => {
    const variants = {
      text: 'h-4 w-full',
      title: 'h-6 w-3/4',
      subtitle: 'h-4 w-1/2',
      circular: 'rounded-full aspect-square',
      rectangular: 'w-full h-full',
      button: 'h-10 w-24',
      avatar: 'w-10 h-10 rounded-full',
      card: 'h-32 w-full',
      table: 'h-8 w-full'
    }
    return variants[variant] || variants.rectangular
  }

  const getRoundedClasses = () => {
    if (variant === 'circular') return 'rounded-full'
    
    const roundedOptions = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    }
    return roundedOptions[rounded] || roundedOptions.md
  }

  const getAnimationClasses = () => {
    const animations = {
      shimmer: 'skeleton',
      pulse: 'animate-pulse bg-secondary-200 dark:bg-secondary-800',
      wave: 'skeleton',
      none: 'bg-secondary-200 dark:bg-secondary-800'
    }
    return animations[animation] || animations.shimmer
  }

  const baseClasses = [
    getVariantClasses(),
    getRoundedClasses(),
    getAnimationClasses(),
    'transition-smooth',
    className
  ].filter(Boolean).join(' ')

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...props.style
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      style={style}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      {...props}
    >
      {children}
    </div>
  )
})

export default Skeleton

// Skeleton Text Component
export function SkeletonText({ lines = 3, spacing = 'md', className = '', ...props }) {
  const getSpacingClass = () => {
    const spacingOptions = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3',
      xl: 'space-y-4'
    }
    return spacingOptions[spacing] || spacingOptions.md
  }

  return (
    <div className={`${getSpacingClass()} ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={index === lines - 1 ? 'w-2/3' : ''}
          {...props}
        />
      ))}
    </div>
  )
}

// Skeleton List Component
export function SkeletonList({ items = 5, spacing = 'md', className = '', itemProps = {} }) {
  const getSpacingClass = () => {
    const spacingOptions = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3',
      xl: 'space-y-4'
    }
    return spacingOptions[spacing] || spacingOptions.md
  }

  return (
    <div className={`${getSpacingClass()} ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <Skeleton variant="avatar" {...itemProps} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" />
            <Skeleton variant="text" className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton Card Component
export function SkeletonCard({ 
  hasHeader = true,
  hasFooter = false,
  bodyLines = 3,
  className = '',
  ...props 
}) {
  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6 ${className}`} {...props}>
      {hasHeader && (
        <div className="mb-4">
          <Skeleton variant="title" className="mb-2" />
          <Skeleton variant="subtitle" />
        </div>
      )}
      
      <div className="mb-4">
        <SkeletonText lines={bodyLines} />
      </div>
      
      {hasFooter && (
        <div className="flex justify-between items-center pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <Skeleton variant="button" />
          <Skeleton variant="button" />
        </div>
      )}
    </div>
  )
}

// Skeleton Table Component
export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  hasHeader = true,
  className = '',
  ...props 
}) {
  return (
    <div className={`bg-white dark:bg-secondary-800 rounded-lg shadow-sm overflow-hidden ${className}`} {...props}>
      {hasHeader && (
        <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, index) => (
              <Skeleton key={index} variant="text" className="h-5" />
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <Skeleton key={colIndex} variant="table" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton Stats Component
export function SkeletonStats({ items = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton variant="subtitle" className="mb-2" />
              <Skeleton variant="title" className="w-16" />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
          <div className="mt-4">
            <Skeleton variant="text" className="w-20 h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}