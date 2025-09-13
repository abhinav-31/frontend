import { forwardRef } from 'react'

const LoadingSpinner = forwardRef(({
  size = 'md',
  variant = 'default',
  thickness = 'normal',
  text,
  position = 'center',
  overlay = false,
  className = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-10 h-10',
      '2xl': 'w-12 h-12'
    }
    return sizes[size] || sizes.md
  }

  const getVariantClasses = () => {
    const variants = {
      default: 'text-primary-600 dark:text-primary-400',
      secondary: 'text-secondary-600 dark:text-secondary-400',
      white: 'text-white',
      success: 'text-success-600 dark:text-success-400',
      warning: 'text-warning-600 dark:text-warning-400',
      error: 'text-error-600 dark:text-error-400'
    }
    return variants[variant] || variants.default
  }

  const getThicknessClasses = () => {
    const thicknesses = {
      thin: '[stroke-width:1]',
      normal: '[stroke-width:2]',
      thick: '[stroke-width:3]'
    }
    return thicknesses[thickness] || thicknesses.normal
  }

  const getPositionClasses = () => {
    const positions = {
      center: 'justify-center items-center',
      left: 'justify-start items-center',
      right: 'justify-end items-center'
    }
    return positions[position] || positions.center
  }

  const SpinnerIcon = () => (
    <svg
      className={`animate-spin ${getSizeClasses()} ${getVariantClasses()}`}
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

  const DotsSpinner = () => (
    <div className={`flex space-x-1 ${getVariantClasses()}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`rounded-full bg-current animate-pulse ${
            size === 'xs' ? 'w-1 h-1' :
            size === 'sm' ? 'w-1.5 h-1.5' :
            size === 'md' ? 'w-2 h-2' :
            size === 'lg' ? 'w-2.5 h-2.5' :
            'w-3 h-3'
          }`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )

  const PulseSpinner = () => (
    <div className={`${getSizeClasses()} ${getVariantClasses()}`}>
      <div className="w-full h-full bg-current rounded-full animate-ping opacity-75" />
    </div>
  )

  const getSpinnerComponent = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />
      case 'pulse':
        return <PulseSpinner />
      default:
        return <SpinnerIcon />
    }
  }

  const spinnerContent = (
    <div
      ref={ref}
      className={`flex ${getPositionClasses()} ${text ? 'flex-col space-y-2' : ''} ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {getSpinnerComponent()}
      {text && (
        <span className={`text-sm font-medium ${getVariantClasses()}`}>
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-xl">
          {spinnerContent}
        </div>
      </div>
    )
  }

  return spinnerContent
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner

// Predefined Loading Spinner Variants
export const ButtonSpinner = ({ ...props }) => (
  <LoadingSpinner size="sm" variant="white" {...props} />
)

export const PageSpinner = ({ ...props }) => (
  <LoadingSpinner size="xl" text="Loading..." overlay {...props} />
)

export const InlineSpinner = ({ ...props }) => (
  <LoadingSpinner size="sm" position="left" {...props} />
)

export const TableSpinner = ({ ...props }) => (
  <LoadingSpinner size="lg" text="Loading data..." className="py-8" {...props} />
)