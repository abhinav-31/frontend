import { forwardRef, useState, useRef, useEffect } from 'react'
import { AlertCircle, Info } from 'lucide-react'

const TextArea = forwardRef(({
  label,
  placeholder,
  helperText,
  error,
  success,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharacterCount = false,
  autoResize = false,
  size = 'md',
  variant = 'default',
  className = '',
  containerClassName = '',
  onFocus,
  onBlur,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const textareaRef = useRef()
  const combinedRef = ref || textareaRef

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
      return 'bg-secondary-50 border-secondary-200 text-secondary-500 cursor-not-allowed resize-none dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-400'
    }

    if (error) {
      return 'bg-white border-error-300 text-secondary-900 placeholder-secondary-400 focus:border-error-500 focus:ring-error-500 dark:bg-secondary-900 dark:border-error-600 dark:text-secondary-100'
    }

    if (success) {
      return 'bg-white border-success-300 text-secondary-900 placeholder-secondary-400 focus:border-success-500 focus:ring-success-500 dark:bg-secondary-900 dark:border-success-600 dark:text-secondary-100'
    }

    const variants = {
      default: 'bg-white border-secondary-300 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-600 dark:text-secondary-100 dark:placeholder-secondary-500',
      filled: 'bg-secondary-50 border-secondary-200 text-secondary-900 placeholder-secondary-400 focus:bg-white focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-100',
      flushed: 'bg-transparent border-0 border-b-2 border-secondary-300 rounded-none px-0 focus:border-primary-500 focus:ring-0 dark:border-secondary-600 dark:text-secondary-100'
    }
    return variants[variant] || variants.default
  }

  const getResizeClasses = () => {
    if (autoResize) return 'resize-none overflow-hidden'
    return 'resize-y'
  }

  const baseClasses = [
    'block w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    getSizeClasses(),
    getVariantClasses(),
    getResizeClasses(),
    className
  ].filter(Boolean).join(' ')

  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const handleChange = (e) => {
    const value = e.target.value
    setCharacterCount(value.length)
    
    if (autoResize && combinedRef.current) {
      // Reset height to auto to get the correct scrollHeight
      combinedRef.current.style.height = 'auto'
      // Set height to scrollHeight to fit content
      combinedRef.current.style.height = `${combinedRef.current.scrollHeight}px`
    }
    
    onChange?.(e)
  }

  const getCharacterCountColor = () => {
    if (!maxLength) return 'text-secondary-500'
    
    const percentage = (characterCount / maxLength) * 100
    if (percentage >= 100) return 'text-error-500'
    if (percentage >= 80) return 'text-warning-500'
    return 'text-secondary-500'
  }

  const isOverLimit = maxLength && characterCount > maxLength

  useEffect(() => {
    if (props.value && combinedRef.current) {
      setCharacterCount(props.value.length)
      
      if (autoResize) {
        combinedRef.current.style.height = 'auto'
        combinedRef.current.style.height = `${combinedRef.current.scrollHeight}px`
      }
    }
  }, [props.value, autoResize])

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={combinedRef}
          className={baseClasses}
          rows={autoResize ? 1 : rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id || 'textarea'}-error` : 
            helperText ? `${props.id || 'textarea'}-helper` : undefined
          }
          {...props}
        />
      </div>
      
      {/* Character count and validation messages */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-start">
          {error && (
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-error-500 mr-1" />
              <p 
                id={`${props.id || 'textarea'}-error`}
                className="text-sm text-error-600 dark:text-error-400"
              >
                {error}
              </p>
            </div>
          )}
          
          {helperText && !error && (
            <div className="flex items-center">
              <Info className="w-4 h-4 text-primary-500 mr-1" />
              <p 
                id={`${props.id || 'textarea'}-helper`}
                className="text-sm text-secondary-500 dark:text-secondary-400"
              >
                {helperText}
              </p>
            </div>
          )}
        </div>
        
        {(showCharacterCount || maxLength) && (
          <div className={`text-xs ${getCharacterCountColor()} ${isOverLimit ? 'font-medium' : ''}`}>
            {maxLength ? (
              <>
                {characterCount}/{maxLength}
                {isOverLimit && (
                  <span className="ml-1 text-error-500">
                    ({characterCount - maxLength} over)
                  </span>
                )}
              </>
            ) : (
              `${characterCount} characters`
            )}
          </div>
        )}
      </div>
    </div>
  )
})

TextArea.displayName = 'TextArea'

export default TextArea

// Auto-resizing TextArea (alias with autoResize=true)
export const AutoResizeTextArea = forwardRef((props, ref) => (
  <TextArea ref={ref} autoResize showCharacterCount {...props} />
))

AutoResizeTextArea.displayName = 'AutoResizeTextArea'

// Rich Text Editor Wrapper (placeholder for future rich text integration)
export const RichTextEditor = forwardRef(({
  value,
  onChange,
  placeholder = 'Start typing...',
  toolbar = true,
  minHeight = '200px',
  maxHeight = '400px',
  className = '',
  ...props
}, ref) => {
  // This is a placeholder implementation
  // In a real application, you would integrate with a rich text editor library
  // such as TinyMCE, Quill, or Draft.js
  
  const handleChange = (e) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="border border-secondary-300 dark:border-secondary-600 rounded-md overflow-hidden">
      {toolbar && (
        <div className="bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-300 dark:border-secondary-600 p-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-1.5 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="p-1.5 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="p-1.5 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded"
              title="Underline"
            >
              <u>U</u>
            </button>
            <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600" />
            <button
              type="button"
              className="p-1.5 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded text-sm"
              title="Heading"
            >
              H1
            </button>
          </div>
        </div>
      )}
      
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full border-0 focus:outline-none focus:ring-0 resize-none
          bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100
          placeholder-secondary-400 p-3 ${className}
        `}
        style={{ minHeight, maxHeight }}
        {...props}
      />
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'