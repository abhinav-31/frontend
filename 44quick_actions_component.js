// components/features/dashboard/components/QuickActions/QuickActions.jsx
import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Users, BookOpen, FileText, Settings, Video, Clock } from 'lucide-react'
import { Grid, GridItem } from '../../../../common/Layout'
import { Card, CardHeader, CardBody } from '../../../../common/DataDisplay'
import { Skeleton } from '../../../../common/Skeleton'
import { QuickActionCard } from './QuickActionCard'
import { usePermission } from '../../../../../providers'

const QuickActions = forwardRef(({
  loading = false,
  className = '',
  ...props
}, ref) => {
  const navigate = useNavigate()
  const { hasPermission, userRole } = usePermission()

  const getActionsForRole = () => {
    const actions = []

    // Admin specific actions
    if (hasPermission('academic-management.course-types.create')) {
      actions.push({
        id: 'create-course-type',
        title: 'Create Course Type',
        description: 'Add new course type to the system',
        icon: <Plus className="w-6 h-6" />,
        color: 'primary',
        onClick: () => navigate('/academic-management/course-types?action=create')
      })
    }

    if (hasPermission('infrastructure-management.batch-cycles.create')) {
      actions.push({
        id: 'create-batch-cycle',
        title: 'New Batch Cycle',
        description: 'Create new academic batch cycle',
        icon: <Calendar className="w-6 h-6" />,
        color: 'success',
        onClick: () => navigate('/infrastructure-management/batch-cycles?action=create')
      })
    }

    if (hasPermission('staff-management.staff.create')) {
      actions.push({
        id: 'add-staff',
        title: 'Add Staff Member',
        description: 'Register new staff to the system',
        icon: <Users className="w-6 h-6" />,
        color: 'warning',
        onClick: () => navigate('/staff-management/staff?action=create')
      })
    }

    // Course Coordinator actions
    if (hasPermission('academic-management.courses.create')) {
      actions.push({
        id: 'create-course',
        title: 'Create Course',
        description: 'Add new course to curriculum',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'primary',
        onClick: () => navigate('/academic-management/courses?action=create')
      })
    }

    if (hasPermission('scheduling-sessions.schedule.create')) {
      actions.push({
        id: 'create-schedule',
        title: 'Create Schedule',
        description: 'Plan weekly course schedule',
        icon: <Calendar className="w-6 h-6" />,
        color: 'info',
        onClick: () => navigate('/scheduling-sessions/schedule?action=create')
      })
    }

    if (hasPermission('student-operations.students.import')) {
      actions.push({
        id: 'import-students',
        title: 'Import Students',
        description: 'Bulk import student data',
        icon: <Users className="w-6 h-6" />,
        color: 'success',
        onClick: () => navigate('/student-operations/students?action=import')
      })
    }

    // General User (Faculty/Lab Mentor) actions
    if (hasPermission('scheduling-sessions.sessions.create')) {
      actions.push({
        id: 'create-session',
        title: 'Create Session',
        description: 'Schedule online or offline session',
        icon: <Video className="w-6 h-6" />,
        color: 'primary',
        onClick: () => navigate('/scheduling-sessions/sessions?action=create')
      })
    }

    if (hasPermission('scheduling-sessions.timesheets.create')) {
      actions.push({
        id: 'submit-timesheet',
        title: 'Submit Timesheet',
        description: 'Log your daily activities',
        icon: <Clock className="w-6 h-6" />,
        color: 'warning',
        onClick: () => navigate('/scheduling-sessions/timesheets?action=create')
      })
    }

    if (hasPermission('scheduling-sessions.videos.create')) {
      actions.push({
        id: 'upload-video',
        title: 'Upload Recording',
        description: 'Add recorded session video',
        icon: <Video className="w-6 h-6" />,
        color: 'info',
        onClick: () => navigate('/scheduling-sessions/videos?action=create')
      })
    }

    // Reports for admin and coordinators
    if (hasPermission('reports-documentation.schedule-reports.generate')) {
      actions.push({
        id: 'generate-report',
        title: 'Generate Report',
        description: 'Create schedule or performance report',
        icon: <FileText className="w-6 h-6" />,
        color: 'secondary',
        onClick: () => navigate('/reports-documentation/schedule-reports')
      })
    }

    // System settings for admin only
    if (hasPermission('system-administration.view')) {
      actions.push({
        id: 'system-settings',
        title: 'System Settings',
        description: 'Manage application configuration',
        icon: <Settings className="w-6 h-6" />,
        color: 'secondary',
        onClick: () => navigate('/system-administration/settings')
      })
    }

    return actions
  }

  const renderSkeletonActions = () => {
    return Array.from({ length: 6 }, (_, index) => (
      <GridItem key={index}>
        <Card className="h-full">
          <CardBody className="p-6">
            <div className="flex items-start space-x-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="title" className="w-3/4" />
                <Skeleton variant="text" className="w-full" />
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
    ))
  }

  if (loading) {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardHeader 
          title="Quick Actions"
          subtitle="Frequently used actions for your role"
        />
        <CardBody>
          <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
            {renderSkeletonActions()}
          </Grid>
        </CardBody>
      </Card>
    )
  }

  const actions = getActionsForRole()

  if (actions.length === 0) {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardHeader 
          title="Quick Actions"
          subtitle="No quick actions available for your current permissions"
        />
      </Card>
    )
  }

  return (
    <Card ref={ref} className={className} {...props}>
      <CardHeader 
        title="Quick Actions"
        subtitle="Frequently used actions for your role"
      />
      <CardBody>
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
          {actions.map((action) => (
            <GridItem key={action.id}>
              <QuickActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={action.onClick}
              />
            </GridItem>
          ))}
        </Grid>
      </CardBody>
    </Card>
  )
})

QuickActions.displayName = 'QuickActions'

export default QuickActions