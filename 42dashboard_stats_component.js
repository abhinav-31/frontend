// components/features/dashboard/components/DashboardStats/DashboardStats.jsx
import { forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { Users, BookOpen, Calendar, FileText, GraduationCap, Building } from 'lucide-react'
import { Grid, GridItem } from '../../../../common/Layout'
import { SkeletonStats } from '../../../../common/Skeleton'
import { StatCard } from './StatCard'
import { usePermission } from '../../../../../providers'

const DashboardStats = forwardRef(({
  loading = false,
  className = '',
  ...props
}, ref) => {
  const { userRole, hasPermission } = usePermission()
  const dashboardData = useSelector(state => state.dashboard.stats)

  const getStatsForRole = () => {
    const baseStats = []

    // Stats visible to all authenticated users
    if (hasPermission('dashboard.view')) {
      baseStats.push(
        {
          id: 'active-courses',
          title: 'Active Courses',
          value: dashboardData?.activeCourses || 0,
          change: dashboardData?.coursesChange || 0,
          changeType: dashboardData?.coursesChangeType || 'neutral',
          icon: <BookOpen className="w-6 h-6" />,
          color: 'primary'
        }
      )
    }

    // Admin specific stats
    if (hasPermission('staff-management.view')) {
      baseStats.push(
        {
          id: 'total-staff',
          title: 'Total Staff',
          value: dashboardData?.totalStaff || 0,
          change: dashboardData?.staffChange || 0,
          changeType: dashboardData?.staffChangeType || 'neutral',
          icon: <Users className="w-6 h-6" />,
          color: 'success'
        },
        {
          id: 'infrastructure',
          title: 'Active Venues',
          value: dashboardData?.activeVenues || 0,
          change: dashboardData?.venuesChange || 0,
          changeType: dashboardData?.venuesChangeType || 'neutral',
          icon: <Building className="w-6 h-6" />,
          color: 'warning'
        }
      )
    }

    // Course Coordinator and Admin stats
    if (hasPermission('student-operations.view')) {
      baseStats.push(
        {
          id: 'enrolled-students',
          title: 'Enrolled Students',
          value: dashboardData?.enrolledStudents || 0,
          change: dashboardData?.studentsChange || 0,
          changeType: dashboardData?.studentsChangeType || 'positive',
          icon: <GraduationCap className="w-6 h-6" />,
          color: 'primary'
        }
      )
    }

    // Scheduling stats for coordinators and general users
    if (hasPermission('scheduling-sessions.view')) {
      baseStats.push(
        {
          id: 'scheduled-sessions',
          title: 'This Week\'s Sessions',
          value: dashboardData?.weekSessions || 0,
          change: dashboardData?.sessionsChange || 0,
          changeType: dashboardData?.sessionsChangeType || 'neutral',
          icon: <Calendar className="w-6 h-6" />,
          color: 'info'
        }
      )
    }

    // Reports stats for admin and coordinators
    if (hasPermission('reports-documentation.view')) {
      baseStats.push(
        {
          id: 'pending-reports',
          title: 'Pending Reports',
          value: dashboardData?.pendingReports || 0,
          change: dashboardData?.reportsChange || 0,
          changeType: dashboardData?.reportsChangeType || 'neutral',
          icon: <FileText className="w-6 h-6" />,
          color: 'error'
        }
      )
    }

    return baseStats
  }

  if (loading) {
    return (
      <div ref={ref} className={className} {...props}>
        <SkeletonStats items={4} />
      </div>
    )
  }

  const stats = getStatsForRole()

  if (stats.length === 0) {
    return (
      <div ref={ref} className={`text-center py-8 ${className}`} {...props}>
        <p className="text-secondary-500 dark:text-secondary-400">
          No dashboard statistics available for your current permissions.
        </p>
      </div>
    )
  }

  return (
    <div ref={ref} className={className} {...props}>
      <Grid 
        columns={{ base: 1, sm: 2, lg: stats.length >= 4 ? 4 : stats.length }} 
        gap="lg"
      >
        {stats.map((stat) => (
          <GridItem key={stat.id}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
            />
          </GridItem>
        ))}
      </Grid>
    </div>
  )
})

DashboardStats.displayName = 'DashboardStats'

export default DashboardStats