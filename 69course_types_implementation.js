// components/features/academic-management/components/CourseTypes/CourseTypesList.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react'
import { 
  useGetCourseTypesQuery,
  useCreateCourseTypeMutation,
  useUpdateCourseTypeMutation,
  useDeleteCourseTypeMutation
} from '../../../../../store/api/academicApi'
import { showToast } from '../../../../../components/common/Feedback/Toast/Toast'
import { 
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  ConfirmDialog,
  Grid,
  GridItem
} from '../../../../../components/common'
import { CourseTypeForm } from './CourseTypeForm'
import { PermissionGuard } from '../../../../../context/PermissionContext'

const CourseTypesList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourseType, setEditingCourseType] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, courseType: null })

  // RTK Query hooks
  const { 
    data: courseTypes = [], 
    isLoading, 
    error,
    refetch 
  } = useGetCourseTypesQuery()

  const [createCourseType, { isLoading: creating }] = useCreateCourseTypeMutation()
  const [updateCourseType, { isLoading: updating }] = useUpdateCourseTypeMutation()
  const [deleteCourseType, { isLoading: deleting }] = useDeleteCourseTypeMutation()

  const handleCreate = async (formData) => {
    try {
      await createCourseType(formData).unwrap()
      showToast.success('Course Type Created', 'Course type has been created successfully')
      setModalOpen(false)
      refetch()
    } catch (error) {
      showToast.error('Creation Failed', error.message || 'Failed to create course type')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await updateCourseType({
        id: editingCourseType.id,
        ...formData
      }).unwrap()
      showToast.success('Course Type Updated', 'Course type has been updated successfully')
      setModalOpen(false)
      setEditingCourseType(null)
      refetch()
    } catch (error) {
      showToast.error('Update Failed', error.message || 'Failed to update course type')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCourseType(deleteConfirm.courseType.id).unwrap()
      showToast.success('Course Type Deleted', 'Course type has been deleted successfully')
      setDeleteConfirm({ open: false, courseType: null })
      refetch()
    } catch (error) {
      showToast.error('Deletion Failed', error.message || 'Failed to delete course type')
    }
  }

  const openEditModal = (courseType) => {
    setEditingCourseType(courseType)
    setModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingCourseType(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCourseType(null)
  }

  const handleCourseTypeClick = (courseType) => {
    // Navigate to courses with courseType filter
    navigate(`/academic-management/courses?courseTypeId=${courseType.id}`, {
      state: { courseType }
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'secondary',
      draft: 'warning'
    }
    return colors[status] || 'secondary'
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Course Types"
        description={error.message || 'Failed to load course types'}
        actionText="Retry"
        onAction={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Course Types
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage course type categories and their configurations
          </p>
        </div>

        <PermissionGuard permission="academic-management.course-types.create">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Course Type
          </Button>
        </PermissionGuard>
      </div>

      {/* Course Types Grid */}
      {isLoading ? (
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="lg">
          {Array.from({ length: 6 }).map((_, index) => (
            <GridItem key={index}>
              <Card>
                <CardBody>
                  <div className="animate-pulse">
                    <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded mb-3" />
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded mb-2" />
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      ) : courseTypes.length === 0 ? (
        <EmptyState
          title="No Course Types Found"
          description="Get started by creating your first course type to organize your academic programs"
          actionText="Add Course Type"
          onAction={openCreateModal}
        />
      ) : (
        <Grid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="lg">
          {courseTypes.map((courseType) => (
            <GridItem key={courseType.id}>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleCourseTypeClick(courseType)}
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(courseType.status)}>
                        {courseType.status}
                      </Badge>
                      
                      <PermissionGuard permission="academic-management.course-types.update">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(courseType)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                      
                      <PermissionGuard permission="academic-management.course-types.delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm({ open: true, courseType })
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {courseType.title}
                  </h3>
                  
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm line-clamp-3">
                    {courseType.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-500 dark:text-secondary-400">
                        Click to view courses
                      </span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        View →
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        size="md"
      >
        <ModalHeader
          title={editingCourseType ? 'Edit Course Type' : 'Create Course Type'}
          subtitle={editingCourseType ? 'Update course type details' : 'Add a new course type to your system'}
        />
        <ModalBody>
          <CourseTypeForm
            courseType={editingCourseType}
            onSubmit={editingCourseType ? handleUpdate : handleCreate}
            onCancel={closeModal}
            isLoading={creating || updating}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, courseType: null })}
        onConfirm={handleDelete}
        title="Delete Course Type"
        message={`Are you sure you want to delete "${deleteConfirm.courseType?.title}"? This action cannot be undone and may affect related courses.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}

export default CourseTypesList