// components/features/dashboard/components/RecentActivity/RecentActivity.jsx
import { forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardHeader, CardBody, EmptyState } from '../../../../common/DataDisplay'
import { SkeletonList } from '../../../../common/Skeleton'
import { ActivityItem } from './ActivityItem'
import { usePermission } from '../../../../../providers'

const RecentActivity = forwardRef(({
  loading = false,
  maxItems = 10,
  className = '',
  ...props
}, ref) => {
  const { hasPermission, userRole } = usePermission()
  const activities = useSelector(state => state.dashboard.recentActivities || [])

  const filterActivitiesForRole = (allActivities) => {
    if (!hasPermission('dashboard.view')) return []

    return allActivities.filter(activity => {
      // Filter activities based on user permissions
      switch (activity.type) {
        case 'course_created':
        case 'module_created':
          return hasPermission('academic-management.view')
        
        case 'student_enrolled':
        case 'group_assigned':
          return hasPermission('student-operations.view')
        
        case 'session_scheduled':
        case 'timesheet_submitted':
          return hasPermission('scheduling-sessions.view')
        
        case 'staff_added':
        case 'role_assigned':
          return hasPermission('staff-management.view')
        
        case 'report_generated':
          return hasPermission('reports-documentation.view')
        
        case 'system_updated':
          return hasPermission('system-administration.view')
        
        default:
          return true // Show general activities to all users
      }
    }).slice(0, maxItems)
  }

  const getSampleActivities = () => {
    // Sample activities for demonstration when no real data is available
    const sampleActivities = [
      {
        id: 1,
        type: 'course_created',
        title: 'New Course Created',
        description: 'Full Stack Development course was created for Web Technology batch',
        user: {
          name: 'Dr. Smith',
          role: 'Course Coordinator'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: {
          courseName: 'Full Stack Development',
          batchCycle: 'Web Technology 2024'
        }
      },
      {
        id: 2,
        type: 'student_enrolled',
        title: 'Students Enrolled',
        description: '25 new students enrolled in Data Science batch',
        user: {
          name: 'Prof. Johnson',
          role: 'Course Coordinator'
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        metadata: {
          studentCount: 25,
          batchCycle: 'Data Science 2024'
        }
      },
      {
        id: 3,
        type: 'session_scheduled',
        title: 'Session Scheduled',
        description: 'Weekly JavaScript fundamentals session scheduled for tomorrow',
        user: {
          name: 'Mr. Davis',
          role: 'Faculty'
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        metadata: {
          sessionTitle: 'JavaScript Fundamentals',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 4,
        type: 'timesheet_submitted',
        title: 'Timesheet Submitted',
        description: 'Weekly timesheet submitted for review and approval',
        user: {
          name: 'Ms. Wilson',
          role: 'Lab Mentor'
        },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        metadata: {
          weekEnding: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalHours: 40
        }
      },
      {
        id: 5,
        type: 'report_generated',
        title: 'Report Generated',
        description: 'Monthly attendance report generated for all active courses',
        user: {
          name: 'Admin',
          role: 'System Administrator'
        },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        metadata: {
          reportType: 'Attendance Report',
          period: 'October 2024'
        }
      }
    ]

    return sampleActivities
  }

  if (loading) {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardHeader 
          title="Recent Activity"
          subtitle="Latest system activities and updates"
        />
        <CardBody>
          <SkeletonList items={5} spacing="lg" />
        </CardBody>
      </Card>
    )
  }

  // Use real activities if available, otherwise use sample data
  const allActivities = activities.length > 0 ? activities : getSampleActivities()
  const filteredActivities = filterActivitiesForRole(allActivities)

  if (filteredActivities.length === 0) {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardHeader 
          title="Recent Activity"
          subtitle="Latest system activities and updates"
        />
        <CardBody>
          <EmptyState
            title="No Recent Activity"
            description="No recent activities to display based on your current permissions."
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card ref={ref} className={className} {...props}>
      <CardHeader 
        title="Recent Activity"
        subtitle="Latest system activities and updates"
      />
      <CardBody className="p-0">
        <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
          {filteredActivities.map((activity, index) => (
            <div key={activity.id} className="p-6">
              <ActivityItem
                activity={activity}
                isLast={index === filteredActivities.length - 1}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
})

RecentActivity.displayName = 'RecentActivity'

export default RecentActivity