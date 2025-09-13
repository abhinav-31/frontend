// components/layout/Header/Header.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Menu, Bell, Search, Sun, Moon, Monitor, LogOut, User, Settings } from 'lucide-react'
import { Button } from '../../common/Button'
import { SearchBar } from '../../common/SearchBar'
import { NotificationBadge } from '../../common/DataDisplay'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from './ThemeToggle'
import { useTheme, useNotification } from '../../../providers'
import { logout } from '../../../store/slices/authSlice'

const Header = ({
  onSidebarToggle,
  sidebarOpen,
  user,
  className = '',
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showSuccess } = useNotification()
  const userMenuRef = useRef(null)

  // Global search functionality
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setShowSearch(false)
    }
  }

  // User menu actions
  const handleProfileClick = () => {
    navigate('/profile')
    setUserMenuOpen(false)
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    setUserMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      showSuccess('Logout Successful', 'You have been logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUserMenuOpen(false)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userMenuItems = [
    {
      label: 'View Profile',
      icon: <User className="w-4 h-4" />,
      onClick: handleProfileClick
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: handleSettingsClick
    },
    { type: 'divider' },
    {
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      variant: 'danger'
    }
  ]

  return (
    <header 
      className={`bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Sidebar toggle and branding */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo/Branding - hidden on mobile when search is active */}
          <div className={`flex items-center space-x-3 ${showSearch ? 'hidden sm:flex' : 'flex'}`}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Staff Portal
              </h1>
            </div>
          </div>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search courses, students, staff..."
            className="w-full"
          />
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate('/notifications')}
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge count={3} className="absolute -top-1 -right-1" />
            </Button>
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials(user?.name || user?.firstName + ' ' + user?.lastName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                  {user?.name || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {user?.role || 'User'}
                </p>
              </div>
            </Button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <UserMenu
                items={userMenuItems}
                onClose={() => setUserMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="md:hidden border-t border-secondary-200 dark:border-secondary-700 p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search courses, students, staff..."
            className="w-full"
          />
        </div>
      )}
    </header>
  )
}

export default Header