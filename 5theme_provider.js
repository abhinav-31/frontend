import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

const THEME_STORAGE_KEY = 'staff-portal-theme'
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_OPTIONS.DARK
    : THEME_OPTIONS.LIGHT
}

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || THEME_OPTIONS.SYSTEM
  } catch {
    return THEME_OPTIONS.SYSTEM
  }
}

const applyTheme = (theme) => {
  const root = document.documentElement
  const effectiveTheme = theme === THEME_OPTIONS.SYSTEM ? getSystemTheme() : theme
  
  root.classList.remove('light', 'dark')
  root.classList.add(effectiveTheme)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const isDark = effectiveTheme === THEME_OPTIONS.DARK
    metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#f8fafc')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return THEME_OPTIONS.SYSTEM
    return getStoredTheme()
  })

  const updateTheme = (newTheme) => {
    if (!Object.values(THEME_OPTIONS).includes(newTheme)) {
      console.warn(`Invalid theme option: ${newTheme}`)
      return
    }

    setTheme(newTheme)
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  const getEffectiveTheme = () => {
    return theme === THEME_OPTIONS.SYSTEM ? getSystemTheme() : theme
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    // Listen for system theme changes when using system theme
    if (theme === THEME_OPTIONS.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleSystemThemeChange = () => {
        applyTheme(theme)
      }

      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  const contextValue = {
    theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme: updateTheme,
    themes: THEME_OPTIONS,
    isSystemTheme: theme === THEME_OPTIONS.SYSTEM,
    isDarkMode: getEffectiveTheme() === THEME_OPTIONS.DARK
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

export default ThemeProvider