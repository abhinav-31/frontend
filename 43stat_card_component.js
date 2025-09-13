// components/features/dashboard/components/DashboardStats/StatCard.jsx
import { forwardRef } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardBody } from '../../../../common/DataDisplay'

export const StatCard = forwardRef(({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'primary',
  loading = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const getColorClasses = () => {
    const colors = {
      primary: {
        icon: 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
        change: 'text-primary-600 dark:text-primary-400'
      },
      success: {
        icon: 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400',
        change: 'text-success-600 dark:text-success-400'
      },
      warning: {
        icon: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
        change: 'text-warning-600 dark:text-warning-400'
      },
      error: {
        icon: 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400',
        change: 'text-error-600 dark:text-error-400'
      },
      info: {
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        change: 'text-blue-600 dark:text-blue-400'
      }
    }
    return colors[color] || colors.primary
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp className="w-4 h-4 text-success-500" />
    }
    if (changeType === 'negative') {
      return <TrendingDown className="w-4 h-4 text-error-500" />
    }
    return <Minus className="w-4 h-4 text-secondary-400" />
  }

  const getChangeTextColor = () => {
    const colors = {
      positive: 'text-success-600 dark:text-success-400',
      negative: 'text-error-600 dark:text-error-400',
      neutral: 'text-secondary-600 dark:text-secondary-400'
    }
    return colors[changeType] || colors.neutral
  }

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  const formatChange = (changeVal) => {
    if (typeof changeVal === 'number') {
      const absChange = Math.abs(changeVal)
      const sign = changeVal >= 0 ? '+' : '-'
      return `${sign}${absChange}%`
    }
    return changeVal
  }

  const colorClasses = getColorClasses()

  if (loading) {
    return (
      <Card ref={ref} className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`} {...props}>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-16" />
            </div>
            <div className="skeleton w-12 h-12 rounded-full" />
          </div>
          <div className="mt-4">
            <div className="skeleton h-3 w-20" />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card 
      ref={ref} 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 truncate">
              {title}
            </p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mt-1">
              {formatValue(value)}
            </p>
          </div>
          
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.icon}`}>
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {change !== undefined && change !== null && (
          <div className="mt-4 flex items-center">
            <div className="flex items-center space-x-1">
              {getChangeIcon()}
              <span className={`text-sm font-medium ${getChangeTextColor()}`}>
                {formatChange(change)}
              </span>
            </div>
            <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">
              from last period
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

export default StatCard