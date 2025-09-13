// CardHeader Component
export const CardHeader = ({
  children,
  title,
  subtitle,
  action,
  divider = true,
  className = '',
  ...props
}) => {
  const baseClasses = [
    'flex items-start justify-between',
    divider ? 'border-b border-secondary-200 dark:border-secondary-700 pb-4 mb-4' : '',
    className
  ].filter(Boolean).join(' ')

  if (title || subtitle) {
    return (
      <div className={baseClasses} {...props}>
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

// CardBody Component  
export const CardBody = ({
  children,
  padding = 'none',
  className = '',
  ...props
}) => {
  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      xs: 'p-2',
      sm: 'p-4', 
      md: 'p-6',
      lg: 'p-8'
    }
    return paddings[padding] || paddings.none
  }

  const baseClasses = [
    'flex-1',
    getPaddingClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

// CardFooter Component
export const CardFooter = ({
  children,
  divider = true,
  justify = 'end',
  className = '',
  ...props
}) => {
  const getJustifyClasses = () => {
    const justifyOptions = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    }
    return justifyOptions[justify] || justifyOptions.end
  }

  const baseClasses = [
    'flex items-center',
    getJustifyClasses(),
    divider ? 'border-t border-secondary-200 dark:border-secondary-700 pt-4 mt-4' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

// Card with Image Component
export const CardImage = ({
  src,
  alt,
  aspectRatio = 'video',
  objectFit = 'cover',
  className = '',
  ...props
}) => {
  const getAspectRatioClasses = () => {
    const ratios = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-[4/3]'
    }
    return ratios[aspectRatio] || ratios.video
  }

  const getObjectFitClasses = () => {
    const fits = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none'
    }
    return fits[objectFit] || fits.cover
  }

  const baseClasses = [
    'w-full overflow-hidden',
    getAspectRatioClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={baseClasses} {...props}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${getObjectFitClasses()}`}
        loading="lazy"
      />
    </div>
  )
}

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  className = '',
  ...props
}) => {
  const getChangeClasses = () => {
    const types = {
      positive: 'text-success-600 dark:text-success-400',
      negative: 'text-error-600 dark:text-error-400',
      neutral: 'text-secondary-600 dark:text-secondary-400'
    }
    return types[changeType] || types.neutral
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 14l5-5 5 5z" />
        </svg>
      )
    }
    if (changeType === 'negative') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className={className} {...props}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
          <div className="skeleton w-12 h-12 rounded-full" />
        </div>
        {change && (
          <div className="mt-4">
            <div className="skeleton h-3 w-20" />
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={className} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 text-primary-600 dark:text-primary-400">
                {icon}
              </div>
            </div>
          </div>
        )}
      </div>
      {change && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${getChangeClasses()}`}>
            {getChangeIcon()}
            <span className="ml-1">{change}</span>
          </div>
        </div>
      )}
    </Card>
  )
}