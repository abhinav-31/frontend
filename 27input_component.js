import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Input = forwardRef(({
  type = 'text',
  size = 'md',
  variant = 'default',
  label,
  placeholder,
  helperText,
  error,
  success,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  className = '',
  containerClassName = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

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

  const getIconColor = () => {
    if (error) return 'text-error-400'
    if (success) return 'text-success-400'
    if (isFocused) return 'text-primary-500'
    return 'text-secondary-400'
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  const baseClasses = [
    'block w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    getSizeClasses(),
    getVariantClasses(),
    leftIcon || leftAddon ? 'pl-10' : '',
    (rightIcon || rightAddon || type === 'password') ? 'pr-10' : '',
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

  const PasswordToggle = () => (
    <button
      type="button"
      className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getIconColor()}`}
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  )

  const ErrorIcon = () => (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <AlertCircle className="w-5 h-5 text-error-400" />
    </div>
  )

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <span className="text-secondary-500 dark:text-secondary-400 sm:text-sm px-3">
              {leftAddon}
            </span>
          </div>
        )}
        
        {leftIcon && !leftAddon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 ${getIconColor()}`}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={baseClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id || 'input'}-error` : 
            helperText ? `${props.id || 'input'}-helper` : undefined
          }
          {...props}
        />
        
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            <span className="text-secondary-500 dark:text-secondary-400 sm:text-sm px-3">
              {rightAddon}
            </span>
          </div>
        )}
        
        {rightIcon && !rightAddon && type !== 'password' && !error && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${getIconColor()}`}>
            {rightIcon}
          </div>
        )}
        
        {type === 'password' && <PasswordToggle />}
        {error && type !== 'password' && <ErrorIcon />}
      </div>
      
      {error && (
        <p 
          id={`${props.id || 'input'}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${props.id || 'input'}-helper`}
          className="mt-1 text-sm text-secondary-500 dark:text-secondary-400"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

// Input Group for multiple related inputs
export const InputGroup = ({ children, spacing = 'md', className = '' }) => {
  const getSpacingClasses = () => {
    const spacings = {
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6'
    }
    return spacings[spacing] || spacings.md
  }

  return (
    <div className={`${getSpacingClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Floating Label Input Variant
export const FloatingInput = forwardRef(({
  label,
  placeholder = ' ',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative">
      <Input
        ref={ref}
        placeholder={placeholder}
        className={`peer ${className}`}
        {...props}
      />
      <label className="absolute text-sm text-secondary-500 dark:text-secondary-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-secondary-900 px-2 peer-focus:px-2 peer-focus:text-primary-600 peer-focus:dark:text-primary-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
        {label}
      </label>
    </div>
  )
})