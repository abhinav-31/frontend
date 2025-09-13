// components/common/Layout/Container/Container.jsx
import { forwardRef } from 'react'

const Container = forwardRef(({
  children,
  maxWidth = 'full',
  centerContent = false,
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const getMaxWidthClasses = () => {
    const maxWidths = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md', 
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
      none: ''
    }
    return maxWidths[maxWidth] || maxWidths.full
  }

  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'px-4',
      md: 'px-6 lg:px-8',
      lg: 'px-8 lg:px-12',
      xl: 'px-12 lg:px-16'
    }
    return paddings[padding] || paddings.md
  }

  const baseClasses = [
    'w-full mx-auto',
    getMaxWidthClasses(),
    getPaddingClasses(),
    centerContent ? 'flex items-center justify-center' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

Container.displayName = 'Container'

export default Container

// Page Container for main content areas
export const PageContainer = forwardRef(({
  children,
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
  ...props
}, ref) => (
  <Container ref={ref} className={`py-8 ${className}`} {...props}>
    {breadcrumbs && (
      <div className="mb-6">
        {breadcrumbs}
      </div>
    )}
    
    {(title || description || actions) && (
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    )}
    
    {children}
  </Container>
))

PageContainer.displayName = 'PageContainer'