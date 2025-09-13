// components/features/dashboard/components/QuickActions/QuickActionCard.jsx
import { forwardRef } from 'react'
import { Card, CardBody } from '../../../../common/DataDisplay'

export const QuickActionCard = forwardRef(({
  title,
  description,
  icon,
  color = 'primary',
  onClick,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const getColorClasses = () => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
      success: 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
      error: 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400',
      info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
    }
    return colors[color] || colors.primary
  }

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  const baseClasses = [
    'h-full transition-all duration-200',
    onClick && !disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <Card 
      ref={ref}
      className={baseClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      {...props}
    >
      <CardBody className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
              {title}
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
})

QuickActionCard.displayName = 'QuickActionCard'

export default QuickActionCard