import { forwardRef } from 'react'

const ProgressBar = forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  striped = false,
  animated = false,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const getSizeClasses = () => {
    const sizes = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-6'
    }
    return sizes[size] || sizes.md
  }

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600'
    }
    return variants[variant] || variants.primary
  }

  const getBackgroundClasses = () => {
    return 'bg-secondary-200 dark:bg-secondary-700'
  }

  const getStripedClasses = () => {
    if (!striped) return ''
    return 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]'
  }

  const getAnimatedClasses = () => {
    if (!animated) return ''
    return 'animate-pulse'
  }

  const baseClasses = [
    'relative w-full rounded-full overflow-hidden',
    getSizeClasses(),
    getBackgroundClasses(),
    className
  ].filter(Boolean).join(' ')

  const barClasses = [
    'h-full rounded-full transition-all duration-500 ease-out',
    getVariantClasses(),
    getStripedClasses(),
    getAnimatedClasses()
  ].filter(Boolean).join(' ')

  const formatLabel = () => {
    if (label) return label
    if (showLabel) return `${Math.round(percentage)}%`
    return null
  }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
            {formatLabel()}
          </span>
          {showLabel && !label && (
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      
      <div
        ref={ref}
        className={baseClasses}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label || `Progress: ${percentage}%`}
        {...props}
      >
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
        />
        
        {size === 'lg' || size === 'xl' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white mix-blend-difference">
              {Math.round(percentage)}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar

// Circular Progress Component
export const CircularProgress = forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  thickness = 'normal',
  showLabel = true,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const getSizeClasses = () => {
    const sizes = {
      xs: { width: 'w-8 h-8', text: 'text-xs' },
      sm: { width: 'w-12 h-12', text: 'text-sm' },
      md: { width: 'w-16 h-16', text: 'text-base' },
      lg: { width: 'w-20 h-20', text: 'text-lg' },
      xl: { width: 'w-24 h-24', text: 'text-xl' }
    }
    return sizes[size] || sizes.md
  }

  const getStrokeWidth = () => {
    const thicknesses = {
      thin: 2,
      normal: 3,
      thick: 4
    }
    return thicknesses[thickness] || thicknesses.normal
  }

  const getVariantClasses = () => {
    const variants = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600'
    }
    return variants[variant] || variants.primary
  }

  const sizeConfig = getSizeClasses()
  const strokeWidth = getStrokeWidth()
  const radius = 20 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div
      ref={ref}
      className={`${sizeConfig.width} relative ${className}`}
      {...props}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-secondary-200 dark:text-secondary-700"
        />
        
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-500 ease-out ${getVariantClasses()}`}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-medium text-secondary-700 dark:text-secondary-300 ${sizeConfig.text}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
})

CircularProgress.displayName = 'CircularProgress'

// Step Progress Component
export const StepProgress = ({ 
  steps, 
  currentStep = 0, 
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: {
        active: 'bg-primary-600 text-white',
        completed: 'bg-primary-600 text-white',
        pending: 'bg-secondary-200 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
      },
      success: {
        active: 'bg-success-600 text-white',
        completed: 'bg-success-600 text-white',
        pending: 'bg-secondary-200 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
      }
    }
    return variants[variant] || variants.primary
  }

  const variantClasses = getVariantClasses()

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className={`flex items-center ${className}`} {...props}>
      {steps.map((step, index) => {
        const status = getStepStatus(index)
        const isLast = index === steps.length - 1

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${variantClasses[status]}`}
              >
                {status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {step.title && (
                <span className="mt-2 text-xs text-center text-secondary-600 dark:text-secondary-400">
                  {step.title}
                </span>
              )}
            </div>
            
            {!isLast && (
              <div className={`w-12 h-0.5 mx-2 ${
                index < currentStep 
                  ? 'bg-primary-600' 
                  : 'bg-secondary-200 dark:bg-secondary-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}