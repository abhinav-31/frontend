// components/common/Layout/Grid/Grid.jsx
import { forwardRef } from 'react'

const Grid = forwardRef(({
  children,
  columns = { base: 1, md: 2, lg: 3 },
  gap = 'md',
  alignItems = 'stretch',
  justifyItems = 'stretch',
  className = '',
  ...props
}, ref) => {
  const getGridClasses = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`
    }
    
    const responsiveClasses = []
    if (columns.base) responsiveClasses.push(`grid-cols-${columns.base}`)
    if (columns.sm) responsiveClasses.push(`sm:grid-cols-${columns.sm}`)
    if (columns.md) responsiveClasses.push(`md:grid-cols-${columns.md}`)
    if (columns.lg) responsiveClasses.push(`lg:grid-cols-${columns.lg}`)
    if (columns.xl) responsiveClasses.push(`xl:grid-cols-${columns.xl}`)
    if (columns['2xl']) responsiveClasses.push(`2xl:grid-cols-${columns['2xl']}`)
    
    return responsiveClasses.join(' ')
  }

  const getGapClasses = () => {
    const gaps = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }
    return gaps[gap] || gaps.md
  }

  const getAlignClasses = () => {
    const alignments = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }
    return alignments[alignItems] || alignments.stretch
  }

  const getJustifyClasses = () => {
    const justifications = {
      start: 'justify-items-start',
      center: 'justify-items-center',
      end: 'justify-items-end',
      stretch: 'justify-items-stretch'
    }
    return justifications[justifyItems] || justifications.stretch
  }

  const baseClasses = [
    'grid',
    getGridClasses(),
    getGapClasses(),
    getAlignClasses(),
    getJustifyClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

Grid.displayName = 'Grid'

// GridItem Component
export const GridItem = forwardRef(({
  children,
  colSpan = 1,
  rowSpan = 1,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  className = '',
  ...props
}, ref) => {
  const getSpanClasses = () => {
    const classes = []
    
    if (typeof colSpan === 'number') {
      classes.push(`col-span-${colSpan}`)
    } else if (typeof colSpan === 'object') {
      if (colSpan.base) classes.push(`col-span-${colSpan.base}`)
      if (colSpan.sm) classes.push(`sm:col-span-${colSpan.sm}`)
      if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`)
      if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`)
    }
    
    if (typeof rowSpan === 'number' && rowSpan > 1) {
      classes.push(`row-span-${rowSpan}`)
    }
    
    if (colStart) classes.push(`col-start-${colStart}`)
    if (colEnd) classes.push(`col-end-${colEnd}`)
    if (rowStart) classes.push(`row-start-${rowStart}`)
    if (rowEnd) classes.push(`row-end-${rowEnd}`)
    
    return classes.join(' ')
  }

  const baseClasses = [
    getSpanClasses(),
    className
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

GridItem.displayName = 'GridItem'

export default Grid

// components/common/Layout/Stack/HStack.jsx
export const HStack = forwardRef(({
  children,
  spacing = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  divider,
  className = '',
  ...props
}, ref) => {
  const getSpacingClasses = () => {
    if (divider) return ''
    
    const spacings = {
      none: 'space-x-0',
      xs: 'space-x-1',
      sm: 'space-x-2', 
      md: 'space-x-4',
      lg: 'space-x-6',
      xl: 'space-x-8'
    }
    return spacings[spacing] || spacings.md
  }

  const getAlignClasses = () => {
    const alignments = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }
    return alignments[align] || alignments.center
  }

  const getJustifyClasses = () => {
    const justifications = {
      start: 'justify-start',
      center: 'justify-center', 
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }
    return justifications[justify] || justifications.start
  }

  const baseClasses = [
    'flex',
    wrap ? 'flex-wrap' : '',
    getAlignClasses(),
    getJustifyClasses(),
    getSpacingClasses(),
    className
  ].filter(Boolean).join(' ')

  if (divider) {
    const childArray = React.Children.toArray(children)
    return (
      <div ref={ref} className={baseClasses} {...props}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 && (
              <div className="flex items-center">
                {divider}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

HStack.displayName = 'HStack'

// components/common/Layout/Stack/VStack.jsx  
export const VStack = forwardRef(({
  children,
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  divider,
  className = '',
  ...props
}, ref) => {
  const getSpacingClasses = () => {
    if (divider) return ''
    
    const spacings = {
      none: 'space-y-0',
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4', 
      lg: 'space-y-6',
      xl: 'space-y-8'
    }
    return spacings[spacing] || spacings.md
  }

  const getAlignClasses = () => {
    const alignments = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end', 
      stretch: 'items-stretch'
    }
    return alignments[align] || alignments.stretch
  }

  const getJustifyClasses = () => {
    const justifications = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end', 
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }
    return justifications[justify] || justifications.start
  }

  const baseClasses = [
    'flex flex-col',
    getAlignClasses(),
    getJustifyClasses(), 
    getSpacingClasses(),
    className
  ].filter(Boolean).join(' ')

  if (divider) {
    const childArray = React.Children.toArray(children)
    return (
      <div ref={ref} className={baseClasses} {...props}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 && divider}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  )
})

VStack.displayName = 'VStack'