// components/common/SearchBar/SearchBar.jsx
import { forwardRef, useState, useRef, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'

const SearchBar = forwardRef(({
  value = '',
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  showFilters = false,
  onFiltersClick,
  debounceMs = 300,
  className = '',
  ...props
}, ref) => {
  const [searchValue, setSearchValue] = useState(value)
  const debounceRef = useRef()
  const inputRef = useRef()

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-secondary-50 border-secondary-200 text-secondary-500 cursor-not-allowed dark:bg-secondary-800 dark:border-secondary-700'
    }

    const variants = {
      default: 'bg-white border-secondary-300 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-600 dark:text-secondary-100',
      filled: 'bg-secondary-50 border-secondary-200 text-secondary-900 placeholder-secondary-400 focus:bg-white focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-100'
    }
    return variants[variant] || variants.default
  }

  const baseClasses = [
    'relative flex items-center w-full'
  ].filter(Boolean).join(' ')

  const inputClasses = [
    'block w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    'pl-10 pr-4',
    getSizeClasses(),
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ')

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchValue(newValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange?.(newValue)
    }, debounceMs)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    onSubmit?.(searchValue)
  }

  const handleClear = () => {
    setSearchValue('')
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    onChange?.('')
    onClear?.()
    inputRef.current?.focus()
  }

  useEffect(() => {
    setSearchValue(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <form onSubmit={handleSubmit} className="flex-1">
        <div className={baseClasses}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
            ) : (
              <Search className="w-4 h-4 text-secondary-400" />
            )}
          </div>
          
          <input
            ref={ref || inputRef}
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={inputClasses}
            {...props}
          />
          
          {searchValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
      
      {showFilters && (
        <button
          type="button"
          onClick={onFiltersClick}
          className="flex items-center justify-center p-2.5 text-secondary-600 dark:text-secondary-400 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Open filters"
        >
          <Filter className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar

// components/common/SearchBar/SearchFilters.jsx
export const SearchFilters = forwardRef(({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  className = '',
  ...props
}, ref) => {
  const handleFilterChange = (filterKey, value) => {
    onFilterChange?.({
      ...activeFilters,
      [filterKey]: value
    })
  }

  const handleClearAll = () => {
    onClearAll?.()
  }

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  )

  return (
    <div ref={ref} className={`bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-2">
            <label className="block text-xs font-medium text-secondary-700 dark:text-secondary-300">
              {filter.label}
            </label>
            
            {filter.type === 'select' && (
              <select
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="block w-full px-3 py-2 text-xs bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {filter.type === 'multiselect' && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filter.options?.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.key]?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentValues = activeFilters[filter.key] || []
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value)
                        handleFilterChange(filter.key, newValues)
                      }}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-secondary-700 dark:text-secondary-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
            
            {filter.type === 'daterange' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={activeFilters[`${filter.key}_start`] || ''}
                  onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={activeFilters[`${filter.key}_end`] || ''}
                  onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
                  className="block w-full px-3 py-2 text-xs bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="End date"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

SearchFilters.displayName = 'SearchFilters'