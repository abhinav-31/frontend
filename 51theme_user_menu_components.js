// components/layout/Header/ThemeToggle.jsx
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '../../common/Button'
import { useTheme } from '../../../providers'

export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme, themes, isDarkMode } = useTheme()

  const cycleTheme = () => {
    const themeOrder = [themes.LIGHT, themes.DARK, themes.SYSTEM]
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case themes.LIGHT:
        return <Sun className="w-5 h-5" />
      case themes.DARK:
        return <Moon className="w-5 h-5" />
      case themes.SYSTEM:
        return <Monitor className="w-5 h-5" />
      default:
        return <Sun className="w-5 h-5" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case themes.LIGHT:
        return 'Light mode'
      case themes.DARK:
        return 'Dark mode'
      case themes.SYSTEM:
        return 'System mode'
      default:
        return 'Light mode'
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className={className}
      title={getThemeLabel()}
      aria-label={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
    >
      {getThemeIcon()}
    </Button>
  )
}

// components/layout/Header/UserMenu.jsx
import { forwardRef } from 'react'

export const UserMenu = forwardRef(({
  items = [],
  onClose,
  className = '',
  ...props
}, ref) => {
  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick()
    }
    onClose?.()
  }

  return (
    <div
      ref={ref}
      className={`absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg py-1 z-50 ${className}`}
      {...props}
    >
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <hr
              key={`divider-${index}`}
              className="my-1 border-secondary-200 dark:border-secondary-700"
            />
          )
        }

        return (
          <button
            key={item.label || index}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
              item.variant === 'danger'
                ? 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            {item.icon && (
              <span className="mr-3 flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
})

UserMenu.displayName = 'UserMenu'