// components/common/Navigation/Breadcrumb/Breadcrumb.jsx
import { forwardRef } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useBreadcrumb } from '../../../../providers'

const Breadcrumb = forwardRef(({
  separator = <ChevronRight className="w-4 h-4" />,
  maxItems = 8,
  showHome = true,
  className = '',
  ...props
}, ref) => {
  const { breadcrumbs, isCurrentPath } = useBreadcrumb()

  if (!breadcrumbs || breadcrumbs.length === 0) return null

  const displayBreadcrumbs = breadcrumbs.slice(0, maxItems)

  const baseClasses = [
    'flex items-center space-x-2 text-sm',
    className
  ].filter(Boolean).join(' ')

  return (
    <nav ref={ref} className={baseClasses} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center space-x-2">
        {displayBreadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem
            key={breadcrumb.path || index}
            href={breadcrumb.path}
            isCurrentPage={isCurrentPath(breadcrumb.path)}
            isFirst={index === 0 && showHome}
            separator={index < displayBreadcrumbs.length - 1 ? separator : null}
            icon={breadcrumb.icon}
          >
            {breadcrumb.title}
          </BreadcrumbItem>
        ))}
      </ol>
    </nav>
  )
})

Breadcrumb.displayName = 'Breadcrumb'

// Breadcrumb Item Component
export const BreadcrumbItem = forwardRef(({
  children,
  href,
  isCurrentPage = false,
  isFirst = false,
  separator,
  icon,
  onClick,
  className = '',
  ...props
}, ref) => {
  const baseClasses = [
    'flex items-center space-x-1',
    className
  ].filter(Boolean).join(' ')

  const linkClasses = [
    'flex items-center space-x-1 transition-colors',
    isCurrentPage 
      ? 'text-primary-600 dark:text-primary-400 font-medium cursor-default'
      : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
  ].filter(Boolean).join(' ')

  const handleClick = (e) => {
    if (isCurrentPage) {
      e.preventDefault()
    } else {
      onClick?.(e)
    }
  }

  const content = (
    <>
      {isFirst && <Home className="w-4 h-4" />}
      {icon && !isFirst && typeof icon === 'string' ? (
        <span className="w-4 h-4 text-center">{icon}</span>
      ) : icon && !isFirst ? (
        icon
      ) : null}
      <span className="truncate">{children}</span>
    </>
  )

  return (
    <li ref={ref} className={baseClasses} {...props}>
      {href && !isCurrentPage ? (
        <a
          href={href}
          className={linkClasses}
          onClick={handleClick}
          aria-current={isCurrentPage ? 'page' : undefined}
        >
          {content}
        </a>
      ) : (
        <span
          className={linkClasses}
          aria-current={isCurrentPage ? 'page' : undefined}
        >
          {content}
        </span>
      )}
      
      {separator && (
        <span className="text-secondary-400 dark:text-secondary-600" aria-hidden="true">
          {separator}
        </span>
      )}
    </li>
  )
})

BreadcrumbItem.displayName = 'BreadcrumbItem'

export default Breadcrumb

// components/common/Navigation/ContextualSelector/ContextualSelector.jsx
export const ContextualSelector = forwardRef(({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  loading = false,
  disabled = false,
  clearable = false,
  className = '',
  ...props
}, ref) => {
  const getSelectedOption = () => {
    return options.find(option => option.value === value)
  }

  const handleSelect = (optionValue) => {
    onChange?.(optionValue)
  }

  const handleClear = () => {
    onChange?.(null)
  }

  const selectedOption = getSelectedOption()

  return (
    <div className={`relative ${className}`} {...props}>
      <select
        ref={ref}
        value={value || ''}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled || loading}
        className="block w-full px-3 py-2 text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {loading ? 'Loading...' : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      
      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

ContextualSelector.displayName = 'ContextualSelector'

// components/common/Navigation/Pagination/Pagination.jsx
export const Pagination = forwardRef(({
  currentPage = 1,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getVisiblePages = () => {
    const delta = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - delta)
    let end = Math.min(totalPages, currentPage + delta)
    
    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisible - 1)
      } else {
        start = Math.max(1, end - maxVisible + 1)
      }
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page)
    }
  }

  const visiblePages = getVisiblePages()
  const sizeClasses = getSizeClasses()

  const buttonClasses = [
    'inline-flex items-center justify-center border transition-smooth',
    sizeClasses,
    'hover:bg-secondary-50 dark:hover:bg-secondary-700',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
  ].join(' ')

  const activeButtonClasses = [
    buttonClasses,
    'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
  ].join(' ')

  const disabledButtonClasses = [
    buttonClasses,
    'opacity-50 cursor-not-allowed pointer-events-none',
    'border-secondary-300 dark:border-secondary-600 text-secondary-500'
  ].join(' ')

  const normalButtonClasses = [
    buttonClasses,
    'border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300'
  ].join(' ')

  return (
    <nav ref={ref} className={`flex items-center justify-center ${className}`} {...props}>
      <div className="flex items-center -space-x-px">
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`${currentPage === 1 ? disabledButtonClasses : normalButtonClasses} rounded-l-md`}
            aria-label="First page"
          >
            First
          </button>
        )}
        
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${currentPage === 1 ? disabledButtonClasses : normalButtonClasses} ${!showFirstLast ? 'rounded-l-md' : ''}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={page === currentPage ? activeButtonClasses : normalButtonClasses}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${currentPage === totalPages ? disabledButtonClasses : normalButtonClasses} ${!showFirstLast ? 'rounded-r-md' : ''}`}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`${currentPage === totalPages ? disabledButtonClasses : normalButtonClasses} rounded-r-md`}
            aria-label="Last page"
          >
            Last
          </button>
        )}
      </div>
    </nav>
  )
})

Pagination.displayName = 'Pagination'