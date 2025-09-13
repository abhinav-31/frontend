import { Button } from '../../Button'

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText = 'Get Started',
  onAction,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'text-secondary-600 dark:text-secondary-400',
      muted: 'text-secondary-500 dark:text-secondary-500',
      error: 'text-error-600 dark:text-error-400',
      warning: 'text-warning-600 dark:text-warning-400'
    }
    return variants[variant] || variants.default
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'py-8',
        icon: 'w-12 h-12',
        title: 'text-lg',
        description: 'text-sm'
      },
      md: {
        container: 'py-12',
        icon: 'w-16 h-16',
        title: 'text-xl',
        description: 'text-base'
      },
      lg: {
        container: 'py-16',
        icon: 'w-20 h-20',
        title: 'text-2xl',
        description: 'text-lg'
      }
    }
    return sizes[size] || sizes.md
  }

  const sizeConfig = getSizeClasses()
  const variantClasses = getVariantClasses()

  const DefaultIcon = () => (
    <svg
      className={`${sizeConfig.icon} ${variantClasses}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )

  const NoDataIcon = () => (
    <svg
      className={`${sizeConfig.icon} ${variantClasses}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  )

  const ErrorIcon = () => (
    <svg
      className={`${sizeConfig.icon} text-error-600 dark:text-error-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  )

  const SearchIcon = () => (
    <svg
      className={`${sizeConfig.icon} ${variantClasses}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )

  const getIconComponent = () => {
    if (icon) return icon
    if (variant === 'error') return <ErrorIcon />
    return <DefaultIcon />
  }

  const baseClasses = [
    'flex flex-col items-center justify-center text-center',
    sizeConfig.container,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={baseClasses} {...props}>
      <div className="mb-4">
        {getIconComponent()}
      </div>

      {title && (
        <h3 className={`font-semibold text-secondary-900 dark:text-secondary-100 ${sizeConfig.title} mb-2`}>
          {title}
        </h3>
      )}

      {description && (
        <p className={`${variantClasses} ${sizeConfig.description} mb-6 max-w-md`}>
          {description}
        </p>
      )}

      {children}

      {(action || onAction) && (
        <div className="mt-4">
          {action || (
            <Button
              variant="primary"
              onClick={onAction}
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState

// Predefined Empty State Components
export const NoDataEmptyState = ({ onRefresh, ...props }) => (
  <EmptyState
    icon={<NoDataIcon />}
    title="No data available"
    description="There's no data to display at the moment. Try refreshing or check back later."
    actionText="Refresh"
    onAction={onRefresh}
    {...props}
  />
)

export const SearchEmptyState = ({ searchTerm, onClearSearch, ...props }) => (
  <EmptyState
    icon={<SearchIcon />}
    title="No results found"
    description={
      searchTerm 
        ? `No results found for "${searchTerm}". Try adjusting your search terms.`
        : "No results found. Try different search terms."
    }
    actionText="Clear Search"
    onAction={onClearSearch}
    {...props}
  />
)

export const ErrorEmptyState = ({ onRetry, error, ...props }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={error?.message || "An unexpected error occurred. Please try again."}
    actionText="Try Again"
    onAction={onRetry}
    {...props}
  />
)

export const CreateFirstEmptyState = ({ entityName = "item", onCreate, ...props }) => (
  <EmptyState
    title={`Create your first ${entityName}`}
    description={`Get started by creating a new ${entityName}. You can customize and manage them from here.`}
    actionText={`Create ${entityName}`}
    onAction={onCreate}
    {...props}
  />
)