// components/common/Table/Table.jsx
import { forwardRef, useState } from 'react'
import { ChevronUp, ChevronDown, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'

const Table = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  striped = false,
  hoverable = true,
  bordered = false,
  className = '',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-white dark:bg-secondary-800',
      simple: 'bg-transparent'
    }
    return variants[variant] || variants.default
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 text-xs',
      md: '[&_th]:px-6 [&_th]:py-3 [&_td]:px-6 [&_td]:py-4 text-sm',
      lg: '[&_th]:px-8 [&_th]:py-4 [&_td]:px-8 [&_td]:py-5 text-base'
    }
    return sizes[size] || sizes.md
  }

  const baseClasses = [
    'min-w-full divide-y divide-secondary-200 dark:divide-secondary-700',
    getVariantClasses(),
    getSizeClasses(),
    striped ? '[&_tbody_tr:nth-child(even)]:bg-secondary-50 dark:[&_tbody_tr:nth-child(even)]:bg-secondary-900/50' : '',
    hoverable ? '[&_tbody_tr]:hover:bg-secondary-50 dark:[&_tbody_tr]:hover:bg-secondary-700/50' : '',
    bordered ? 'border border-secondary-200 dark:border-secondary-700' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <table ref={ref} className={baseClasses} {...props}>
        {children}
      </table>
    </div>
  )
})

Table.displayName = 'Table'

// Table Head Component
export const TableHead = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'bg-secondary-50 dark:bg-secondary-900',
    className
  ].filter(Boolean).join(' ')

  return (
    <thead ref={ref} className={baseClasses} {...props}>
      {children}
    </thead>
  )
})

TableHead.displayName = 'TableHead'

// Table Body Component
export const TableBody = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700',
    className
  ].filter(Boolean).join(' ')

  return (
    <tbody ref={ref} className={baseClasses} {...props}>
      {children}
    </tbody>
  )
})

TableBody.displayName = 'TableBody'

// Table Row Component
export const TableRow = forwardRef(({
  children,
  selected = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'transition-colors',
    selected ? 'bg-primary-50 dark:bg-primary-900/20' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <tr ref={ref} className={baseClasses} {...props}>
      {children}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

// Table Header Cell Component
export const TableHeader = forwardRef(({
  children,
  sortable = false,
  sortDirection,
  onSort,
  align = 'left',
  className = '',
  ...props
}, ref) => {
  const getAlignClasses = () => {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }
    return alignments[align] || alignments.left
  }

  const baseClasses = [
    'font-medium text-secondary-900 dark:text-secondary-100 uppercase tracking-wider',
    getAlignClasses(),
    sortable ? 'cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 select-none' : '',
    className
  ].filter(Boolean).join(' ')

  const handleSort = () => {
    if (sortable && onSort) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(newDirection)
    }
  }

  return (
    <th ref={ref} className={baseClasses} onClick={handleSort} {...props}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-primary-600' : 'text-secondary-400'}`} />
            <ChevronDown className={`w-3 h-3 -mt-1 ${sortDirection === 'desc' ? 'text-primary-600' : 'text-secondary-400'}`} />
          </div>
        )}
      </div>
    </th>
  )
})

TableHeader.displayName = 'TableHeader'

// Table Cell Component
export const TableCell = forwardRef(({
  children,
  align = 'left',
  className = '',
  ...props
}, ref) => {
  const getAlignClasses = () => {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }
    return alignments[align] || alignments.left
  }

  const baseClasses = [
    'text-secondary-900 dark:text-secondary-100 whitespace-nowrap',
    getAlignClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <td ref={ref} className={baseClasses} {...props}>
      {children}
    </td>
  )
})

TableCell.displayName = 'TableCell'

// Table Actions Component
export const TableActions = forwardRef(({
  actions = [],
  onView,
  onEdit,
  onDelete,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)

  const defaultActions = [
    onView && { label: 'View', icon: <Eye className="w-4 h-4" />, onClick: onView },
    onEdit && { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: onEdit },
    onDelete && { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, variant: 'danger' }
  ].filter(Boolean)

  const allActions = [...defaultActions, ...actions]

  if (allActions.length === 0) return null

  return (
    <div ref={ref} className={`relative ${className}`} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
        aria-label="Open actions menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-md shadow-lg py-1">
            {allActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  action.onClick?.()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-secondary-50 dark:hover:bg-secondary-700 ${
                  action.variant === 'danger' 
                    ? 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                    : 'text-secondary-700 dark:text-secondary-300'
                }`}
              >
                {action.icon && (
                  <span className="mr-3">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

TableActions.displayName = 'TableActions'

export default Table

// components/common/ErrorBoundary/ErrorBoundary.jsx
import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          showDetails={this.props.showDetails}
        />
      )
    }

    return this.props.children
  }
}

// Error Fallback Component
export const ErrorFallback = ({
  error,
  onRetry,
  showDetails = process.env.NODE_ENV === 'development',
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  showRetryButton = true,
  showHomeButton = true
}) => {
  const handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-error-100 dark:bg-error-900/20 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              {title}
            </h2>
            
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-6">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {showRetryButton && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              
              {showHomeButton && (
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center justify-center px-4 py-2 border border-secondary-300 dark:border-secondary-600 text-sm font-medium rounded-md text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              )}
            </div>
            
            {showDetails && error && (
              <details className="mt-6 w-full">
                <summary className="cursor-pointer text-sm text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300">
                  Show technical details
                </summary>
                <div className="mt-2 p-3 bg-secondary-50 dark:bg-secondary-900/50 rounded-md text-left">
                  <p className="text-xs font-mono text-error-600 dark:text-error-400 break-words">
                    {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 text-xs font-mono text-secondary-500 dark:text-secondary-400 whitespace-pre-wrap overflow-x-auto max-h-32">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary