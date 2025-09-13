import { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X, Search, AlertCircle } from 'lucide-react'

const Select = forwardRef(({
  options = [],
  value,
  onChange,
  onBlur,
  placeholder = 'Select option...',
  searchable = false,
  clearable = false,
  disabled = false,
  loading = false,
  multiple = false,
  size = 'md',
  variant = 'default',
  label,
  error,
  helperText,
  required = false,
  className = '',
  containerClassName = '',
  maxHeight = '200px',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef(null)
  const searchInputRef = useRef(null)
  const optionsRef = useRef([])

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-3 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base'
    }
    return sizes[size] || sizes.md
  }

  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-secondary-50 border-secondary-200 text-secondary-500 cursor-not-allowed dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-400'
    }

    if (error) {
      return 'bg-white border-error-300 text-secondary-900 focus:border-error-500 focus:ring-error-500 dark:bg-secondary-900 dark:border-error-600 dark:text-secondary-100'
    }

    const variants = {
      default: 'bg-white border-secondary-300 text-secondary-900 focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-600 dark:text-secondary-100',
      filled: 'bg-secondary-50 border-secondary-200 text-secondary-900 focus:bg-white focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-100'
    }
    return variants[variant] || variants.default
  }

  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const getSelectedLabel = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0])
        return option?.label || value[0]
      }
      return `${value.length} items selected`
    }
    
    const option = options.find(opt => opt.value === value)
    return option?.label || placeholder
  }

  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : []
      const index = newValue.indexOf(optionValue)
      
      if (index > -1) {
        newValue.splice(index, 1)
      } else {
        newValue.push(optionValue)
      }
      
      onChange?.({ target: { value: newValue } })
    } else {
      onChange?.({ target: { value: optionValue } })
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.({ target: { value: multiple ? [] : '' } })
    setSearchQuery('')
  }

  const handleKeyDown = (e) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          handleOptionSelect(filteredOptions[focusedIndex]?.value)
        } else {
          setIsOpen(!isOpen)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        selectRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
        }
        break
    }
  }

  const isSelected = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue)
    }
    return value === optionValue
  }

  const showClearButton = clearable && !disabled && (
    (multiple && Array.isArray(value) && value.length > 0) ||
    (!multiple && value)
  )

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        setFocusedIndex(-1)
        onBlur?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  const baseClasses = [
    'relative w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    getSizeClasses(),
    getVariantClasses(),
    'cursor-pointer',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          className={baseClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <div className="flex items-center justify-between pr-2">
            <span className={`block truncate ${!value && !multiple ? 'text-secondary-400' : ''}`}>
              {getSelectedLabel()}
            </span>
            
            <div className="flex items-center space-x-1">
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
              )}
              
              {showClearButton && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-secondary-400 hover:text-secondary-600 p-1"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <ChevronDown 
                className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-lg">
            {searchable && (
              <div className="p-2 border-b border-secondary-200 dark:border-secondary-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-transparent border border-secondary-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            <div 
              className="max-h-60 overflow-auto py-1"
              style={{ maxHeight }}
              role="listbox"
              aria-label="Options"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-secondary-500 dark:text-secondary-400">
                  {searchQuery ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    ref={(el) => (optionsRef.current[index] = el)}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center justify-between
                      hover:bg-secondary-50 dark:hover:bg-secondary-700
                      ${focusedIndex === index ? 'bg-secondary-50 dark:bg-secondary-700' : ''}
                      ${isSelected(option.value) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    role="option"
                    aria-selected={isSelected(option.value)}
                  >
                    <div className="flex items-center">
                      {option.icon && (
                        <span className="mr-2 flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span className="block truncate text-sm text-secondary-900 dark:text-secondary-100">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                          {option.description}
                        </span>
                      )}
                    </div>
                    
                    {isSelected(option.value) && (
                      <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center mt-1">
          <AlertCircle className="w-4 h-4 text-error-500 mr-1" />
          <p className="text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select

// Multi-Select Component (alias with multiple=true)
export const MultiSelect = forwardRef((props, ref) => (
  <Select ref={ref} multiple searchable clearable {...props} />
))

MultiSelect.displayName = 'MultiSelect'

// Async Select Component for dynamic options
export const AsyncSelect = forwardRef(({
  loadOptions,
  debounceMs = 300,
  ...props
}, ref) => {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef = useRef()

  useEffect(() => {
    const loadData = async (query = '') => {
      setLoading(true)
      try {
        const results = await loadOptions(query)
        setOptions(results || [])
      } catch (error) {
        console.error('Error loading options:', error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      loadData(searchQuery)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery, loadOptions, debounceMs])

  return (
    <Select
      ref={ref}
      options={options}
      loading={loading}
      searchable
      onSearch={setSearchQuery}
      {...props}
    />
  )
})

AsyncSelect.displayName = 'AsyncSelect'

// Creatable Select Component
export const CreatableSelect = forwardRef(({
  options: initialOptions = [],
  onCreate,
  createLabel = "Create",
  ...props
}, ref) => {
  const [options, setOptions] = useState(initialOptions)

  const handleCreate = async (inputValue) => {
    if (!inputValue.trim()) return

    const newOption = {
      value: inputValue,
      label: inputValue
    }

    try {
      const createdOption = await onCreate?.(newOption) || newOption
      setOptions(prev => [...prev, createdOption])
      return createdOption.value
    } catch (error) {
      console.error('Error creating option:', error)
    }
  }

  const enhancedOptions = [...options]
  
  // Add create option if there's search query that doesn't match existing options
  // This would need to be implemented based on search functionality

  return (
    <Select
      ref={ref}
      options={enhancedOptions}
      {...props}
    />
  )
})

CreatableSelect.displayName = 'CreatableSelect'