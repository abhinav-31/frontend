import { forwardRef } from 'react'

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  border = true,
  hover = false,
  className = '',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-white dark:bg-secondary-800',
      elevated: 'bg-white dark:bg-secondary-800',
      outlined: 'bg-white border-secondary-200 dark:bg-secondary-800 dark:border-secondary-700',
      filled: 'bg-secondary-50 dark:bg-secondary-900',
      ghost: 'bg-transparent'
    }
    return variants[variant] || variants.default
  }

  const getPaddingClasses = () => {
    const paddings = {
      none: 'p-0',
      xs: 'p-2',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }
    return paddings[padding] || paddings.md
  }

  const getShadowClasses = () => {
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    }
    return shadows[shadow] || shadows.sm
  }

  const getRoundedClasses = () => {
    const roundedOptions = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl'
    }
    return roundedOptions[rounded] || roundedOptions.lg
  }

  const getBorderClasses = () => {
    if (!border) return ''
    if (variant === 'outlined') return 'border'
    return 'border border-secondary-100 dark:border-secondary-700'
  }

  const getHoverClasses = () => {
    return hover ? 'transition-smooth hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
  }

  const baseClasses = [
    'relative',
    getVariantClasses(),
    getPaddingClasses(),
    getShadowClasses(),
    getRoundedClasses(),
    getBorderClasses(),
    getHoverClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={baseClasses}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card