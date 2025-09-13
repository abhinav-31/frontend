import { forwardRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'

const DatePicker = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  variant = 'default',
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeIntervals = 15,
  dateFormat,
  placeholderText,
  disabled = false,
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
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

    const variants = {
      default: 'bg-white border-secondary-300 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-600 dark:text-secondary-100 dark:placeholder-secondary-500',
      filled: 'bg-secondary-50 border-secondary-200 text-secondary-900 placeholder-secondary-400 focus:bg-white focus:border-primary-500 focus:ring-primary-500 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-100'
    }
    return variants[variant] || variants.default
  }

  const getDefaultDateFormat = () => {
    if (dateFormat) return dateFormat
    if (showTimeSelectOnly) return 'HH:mm'
    if (showTimeSelect) return 'dd/MM/yyyy HH:mm'
    return 'dd/MM/yyyy'
  }

  const getDefaultPlaceholder = () => {
    if (placeholderText) return placeholderText
    if (showTimeSelectOnly) return 'Select time'
    if (showTimeSelect) return 'Select date and time'
    return 'Select date'
  }

  const baseInputClasses = [
    'block w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    'pr-10', // Space for icon
    getSizeClasses(),
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ')

  const CustomInput = forwardRef(({ value, onClick, onChange }, inputRef) => (
    <div className="relative">
      <input
        ref={inputRef}
        value={value || ''}
        onClick={onClick}
        onChange={onChange}
        readOnly
        className={baseInputClasses}
        placeholder={getDefaultPlaceholder()}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${props.id || 'datepicker'}-error` : 
          helperText ? `${props.id || 'datepicker'}-helper` : undefined
        }
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {error ? (
          <AlertCircle className="w-5 h-5 text-error-400" />
        ) : showTimeSelect || showTimeSelectOnly ? (
          <Clock className="w-5 h-5 text-secondary-400" />
        ) : (
          <Calendar className="w-5 h-5 text-secondary-400" />
        )}
      </div>
    </div>
  ))

  CustomInput.displayName = 'CustomInput'

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <ReactDatePicker
        ref={ref}
        customInput={<CustomInput />}
        dateFormat={getDefaultDateFormat()}
        showTimeSelect={showTimeSelect}
        showTimeSelectOnly={showTimeSelectOnly}
        timeIntervals={timeIntervals}
        disabled={disabled}
        popperClassName="react-datepicker-popper"
        calendarClassName="react-datepicker-calendar"
        wrapperClassName="w-full"
        {...props}
      />
      
      {error && (
        <p 
          id={`${props.id || 'datepicker'}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${props.id || 'datepicker'}-helper`}
          className="mt-1 text-sm text-secondary-500 dark:text-secondary-400"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker

// Date Range Picker Component
export const DateRangePicker = forwardRef(({
  label,
  startDate,
  endDate,
  onDateChange,
  error,
  helperText,
  required = false,
  size = 'md',
  containerClassName = '',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-3 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base'
    }
    return sizes[size] || sizes.md
  }

  const baseInputClasses = [
    'block w-full rounded-md border transition-smooth',
    'focus:outline-none focus:ring-1',
    'bg-white border-secondary-300 text-secondary-900 placeholder-secondary-400',
    'focus:border-primary-500 focus:ring-primary-500',
    'dark:bg-secondary-900 dark:border-secondary-600 dark:text-secondary-100',
    'pr-10',
    getSizeClasses()
  ].filter(Boolean).join(' ')

  const CustomInput = forwardRef(({ value, onClick }, inputRef) => (
    <div className="relative">
      <input
        ref={inputRef}
        value={value || ''}
        onClick={onClick}
        readOnly
        className={baseInputClasses}
        placeholder="Select date range"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Calendar className="w-5 h-5 text-secondary-400" />
      </div>
    </div>
  ))

  CustomInput.displayName = 'CustomInput'

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <ReactDatePicker
        ref={ref}
        selected={startDate}
        onChange={(dates) => {
          const [start, end] = dates
          onDateChange?.(start, end)
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        customInput={<CustomInput />}
        dateFormat="dd/MM/yyyy"
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

DateRangePicker.displayName = 'DateRangePicker'

// Time Picker Component (alias for time-only selection)
export const TimePicker = forwardRef((props, ref) => (
  <DatePicker
    ref={ref}
    showTimeSelect
    showTimeSelectOnly
    {...props}
  />
))

TimePicker.displayName = 'TimePicker'