// components/features/dashboard/components/RecentActivity/ActivityItem.jsx
import { forwardRef } from 'react'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Settings,
  UserPlus,
  GraduationCap,
  Video,
  CheckCircle
} from 'lucide-react'

export const ActivityItem = forwardRef(({
  activity,
  isLast = false,
  className = '',
  ...props
}, ref) => {
  const getActivityIcon = (type) => {
    const iconProps = { className: "w-5 h-5" }
    
    const icons = {
      course_created: <BookOpen {...iconProps} className="w-5 h-5 text-primary-500" />,
      module_created: <BookOpen {...iconProps} className="w-5 h-5 text-blue-500" />,
      student_enrolled: <GraduationCap {...iconProps} className="w-5 h-5 text-success-500" />,
      group_assigned: <Users {...iconProps} className="w-5 h-5 text-warning-500" />,
      session_scheduled: <Calendar {...iconProps} className="w-5 h-5 text-info-500" />,
      session_completed: <CheckCircle {...iconProps} className="w-5 h-5 text-success-500" />,
      timesheet_submitted: <Clock {...iconProps} className="w-5 h-5 text-warning-500" />,
      timesheet_approved: <CheckCircle {...iconProps} className="w-5 h-5 text-success-500" />,
      staff_added: <UserPlus {...iconProps} className="w-5 h-5 text-primary-500" />,
      role_assigned: <Users {...iconProps} className="w-5 h-5 text-blue-500" />,
      report_generated: <FileText {...iconProps} className="w-5 h-5 text-secondary-500" />,
      video_uploaded: <Video {...iconProps} className="w-5 h-5 text-purple-500" />,
      system_updated: <Settings {...iconProps} className="w-5 h-5 text-secondary-500" />
    }
    
    return icons[type] || <FileText {...iconProps} className="w-5 h-5 text-secondary-500" />
  }

  const getActivityColor = (type) => {
    const colors = {
      course_created: 'bg-primary-100 dark:bg-primary-900/20',
      module_created: 'bg-blue-100 dark:bg-blue-900/20',
      student_enrolled: 'bg-success-100 dark:bg-success-900/20',
      group_assigned: 'bg-warning-100 dark:bg-warning-900/20',
      session_scheduled: 'bg-blue-100 dark:bg-blue-900/20',
      session_completed: 'bg-success-100 dark:bg-success-900/20',
      timesheet_submitted: 'bg-warning-100 dark:bg-warning-900/20',
      timesheet_approved: 'bg-success-100 dark:bg-success-900/20',
      staff_added: 'bg-primary-100 dark:bg-primary-900/20',
      role_assigned: 'bg-blue-100 dark:bg-blue-900/20',
      report_generated: 'bg-secondary-100 dark:bg-secondary-800',
      video_uploaded: 'bg-purple-100 dark:bg-purple-900/20',
      system_updated: 'bg-secondary-100 dark:bg-secondary-800'
    }
    
    return colors[type] || 'bg-secondary-100 dark:bg-secondary-800'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return time.toLocaleDateString()
  }

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role) => {
    const colors = {
      'System Administrator': 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-300',
      'Course Coordinator': 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
      'Faculty': 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300',
      'Lab Mentor': 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300'
    }
    
    return colors[role] || 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300'
  }

  return (
    <div ref={ref} className={`flex items-start space-x-3 ${className}`} {...props}>
      {/* Activity Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
              {activity.title}
            </p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">
              {activity.description}
            </p>
            
            {/* User and Role Information */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {getUserInitials(activity.user.name)}
                </div>
                <span className="text-xs text-secondary-600 dark:text-secondary-400">
                  {activity.user.name}
                </span>
              </div>
              
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(activity.user.role)}`}>
                {activity.user.role}
              </span>
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="flex-shrink-0 ml-2">
            <time className="text-xs text-secondary-500 dark:text-secondary-400">
              {formatTimeAgo(activity.timestamp)}
            </time>
          </div>
        </div>

        {/* Optional metadata display */}
        {activity.metadata && (
          <div className="mt-2 flex flex-wrap gap-2">
            {activity.metadata.courseName && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 text-xs rounded">
                {activity.metadata.courseName}
              </span>
            )}
            {activity.metadata.batchCycle && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 text-xs rounded">
                {activity.metadata.batchCycle}
              </span>
            )}
            {activity.metadata.studentCount && (
              <span className="inline-flex items-center px-2 py-1 bg-success-50 dark:bg-success-900/10 text-success-700 dark:text-success-300 text-xs rounded">
                {activity.metadata.studentCount} students
              </span>
            )}
            {activity.metadata.totalHours && (
              <span className="inline-flex items-center px-2 py-1 bg-warning-50 dark:bg-warning-900/10 text-warning-700 dark:text-warning-300 text-xs rounded">
                {activity.metadata.totalHours} hours
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'

export default ActivityItem