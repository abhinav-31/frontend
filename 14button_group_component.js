import { Children, cloneElement } from 'react'

const ButtonGroup = ({
  children,
  size = 'md',
  variant = 'primary',
  orientation = 'horizontal',
  spacing = 'none',
  attached = true,
  className = '',
  ...props
}) => {
  const getOrientationClasses = () => {
    const orientations = {
      horizontal: attached ? 'flex' : 'flex flex-wrap',
      vertical: attached ? 'flex flex-col' : 'flex flex-col'
    }
    return orientations[orientation] || orientations.horizontal
  }

  const getSpacingClasses = () => {
    if (attached) return ''
    
    const spacings = {
      none: '',
      sm: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
      md: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
      lg: orientation === 'horizontal' ? 'gap-3' : 'gap-3',
      xl: orientation === 'horizontal' ? 'gap-4' : 'gap-4'
    }
    return spacings[spacing] || spacings.none
  }

  const getAttachedClasses = (index, total) => {
    if (!attached) return ''

    let classes = ''
    
    if (orientation === 'horizontal') {
      // Horizontal attached buttons
      if (total === 1) {
        classes = 'rounded-md'
      } else if (index === 0) {
        classes = 'rounded-l-md rounded-r-none border-r-0'
      } else if (index === total - 1) {
        classes = 'rounded-r-md rounded-l-none'
      } else {
        classes = 'rounded-none border-r-0'
      }
    } else {
      // Vertical attached buttons
      if (total === 1) {
        classes = 'rounded-md'
      } else if (index === 0) {
        classes = 'rounded-t-md rounded-b-none border-b-0'
      } else if (index === total - 1) {
        classes = 'rounded-b-md rounded-t-none'
      } else {
        classes = 'rounded-none border-b-0'
      }
    }
    
    return classes
  }

  const baseClasses = [
    getOrientationClasses(),
    getSpacingClasses(),
    attached ? 'shadow-sm' : '',
    className
  ].filter(Boolean).join(' ')

  const childrenArray = Children.toArray(children)
  const totalChildren = childrenArray.length

  return (
    <div 
      className={baseClasses}
      role="group"
      aria-label="Button group"
      {...props}
    >
      {childrenArray.map((child, index) => {
        if (!child || typeof child !== 'object') return child

        const attachedClasses = getAttachedClasses(index, totalChildren)
        const isFirstChild = index === 0
        const isLastChild = index === totalChildren - 1

        return cloneElement(child, {
          key: child.key || index,
          size: child.props.size || size,
          variant: child.props.variant || variant,
          className: [
            child.props.className || '',
            attachedClasses,
            // Z-index management for focus states in attached mode
            attached ? 'relative hover:z-10 focus:z-10' : ''
          ].filter(Boolean).join(' '),
          'data-first': isFirstChild,
          'data-last': isLastChild,
          'data-position': index
        })
      })}
    </div>
  )
}

export default ButtonGroup