// components/layout/Sidebar/Sidebar.jsx
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../common/Button'
import { SidebarMenu } from './SidebarMenu'
import { usePermission } from '../../../providers'

const Sidebar = ({
  isOpen,
  isCollapsed,
  onToggle,
  onCollapse,
  className = '',
  ...props
}) => {
  const location = useLocation()
  const { getAccessibleMenuItems, userRole } = usePermission()
  const [expandedGroups, setExpandedGroups] = useState(new Set(['dashboard']))

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // Get menu items based on user permissions
  const getMenuStructure = () => {
    const accessibleItems = getAccessibleMenuItems()
    
    // Base menu structure - filter based on accessible items
    const menuStructure = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'home',
        single: true
      },
      {
        key: 'academic-management',
        label: 'Academic Management',
        icon: 'academic-cap',
        children: [
          { key: 'course-types', label: 'Course Types', path: '/academic-management/course-types' },
          { key: 'courses', label: 'Courses', path: '/academic-management/courses' },
          { key: 'modules', label: 'Modules', path: '/academic-management/modules' },
          { key: 'subjects', label: 'Subjects', path: '/academic-management/subjects' },
          { key: 'sections', label: 'Sections', path: '/academic-management/sections' },
          { key: 'topics', label: 'Topics', path: '/academic-management/topics' }
        ]
      },
      {
        key: 'infrastructure-management',
        label: 'Infrastructure Management',
        icon: 'building-office',
        children: [
          { key: 'batch-cycles', label: 'Batch Cycles', path: '/infrastructure-management/batch-cycles' },
          { key: 'premises', label: 'Premises', path: '/infrastructure-management/premises' },
          { key: 'infrastructure', label: 'Infrastructure', path: '/infrastructure-management/infrastructure' }
        ]
      },
      {
        key: 'staff-management',
        label: 'Staff Management',
        icon: 'users',
        children: [
          { key: 'staff', label: 'Staff', path: '/staff-management/staff' },
          { key: 'role-assignment', label: 'Role Assignment', path: '/staff-management/role-assignment' },
          { key: 'coordinator-assignment', label: 'Coordinator Assignment', path: '/staff-management/coordinator-assignment' }
        ]
      },
      {
        key: 'student-operations',
        label: 'Student Operations',
        icon: 'academic-cap',
        children: [
          { key: 'students', label: 'Students', path: '/student-operations/students' },
          { key: 'course-groups', label: 'Course Groups', path: '/student-operations/course-groups' }
        ]
      },
      {
        key: 'scheduling-sessions',
        label: 'Scheduling & Sessions',
        icon: 'calendar-days',
        children: [
          { key: 'schedule', label: 'Schedule', path: '/scheduling-sessions/schedule' },
          { key: 'sessions', label: 'Sessions', path: '/scheduling-sessions/sessions' },
          { key: 'videos', label: 'Recorded Videos', path: '/scheduling-sessions/videos' },
          { key: 'timesheets', label: 'Timesheets', path: '/scheduling-sessions/timesheets' }
        ]
      },
      {
        key: 'system-administration',
        label: 'System Administration',
        icon: 'cog-6-tooth',
        children: [
          { key: 'menus', label: 'Menu Management', path: '/system-administration/menus' },
          { key: 'role-menus', label: 'Role-Based Menu', path: '/system-administration/role-menus' },
          { key: 'settings', label: 'System Settings', path: '/system-administration/settings' }
        ]
      },
      {
        key: 'reports-documentation',
        label: 'Reports & Documentation',
        icon: 'document-chart-bar',
        children: [
          { key: 'schedule-reports', label: 'Schedule Reports', path: '/reports-documentation/schedule-reports' },
          { key: 'certificates', label: 'Student Certificates', path: '/reports-documentation/certificates' },
          { key: 'documents', label: 'Document Management', path: '/reports-documentation/documents' }
        ]
      }
    ]

    // Filter menu items based on accessible items
    return menuStructure.filter(group => {
      if (group.single) {
        return accessibleItems.some(item => item.path === group.path)
      }
      
      // Filter children based on accessible items
      const accessibleChildren = group.children?.filter(child =>
        accessibleItems.some(item => item.path === child.path)
      ) || []
      
      return accessibleChildren.length > 0
    }).map(group => ({
      ...group,
      children: group.children?.filter(child =>
        accessibleItems.some(item => item.path === child.path)
      )
    }))
  }

  const filteredMenu = getMenuStructure()

  const baseClasses = [
    'bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700',
    'flex flex-col h-full',
    isCollapsed ? 'w-16' : 'w-64',
    className
  ].filter(Boolean).join(' ')

  return (
    <aside className={baseClasses} {...props}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Staff Portal
              </h2>
            </div>
          </div>
        )}
        
        {/* Collapse toggle button (desktop only) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="hidden md:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <SidebarMenu
          items={filteredMenu}
          currentPath={location.pathname}
          isCollapsed={isCollapsed}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
        />
      </nav>

      {/* User role indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                {userRole?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                {userRole?.replace('_', ' ') || 'User'}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                Role
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar