// components/features/academic-management/components/CourseTypes/CourseTypeForm.jsx
import { useState, useEffect } from 'react'
import { 
  Input, 
  TextArea, 
  Select, 
  FormField, 
  Button,
  VStack 
} from '../../../../../components/common'

export const CourseTypeForm = ({
  courseType,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (courseType) {
      setFormData({
        title: courseType.title || '',
        description: courseType.description || '',
        status: courseType.status || 'active'
      })
    }
  }, [courseType])

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing="lg">
        <FormField
          label="Title"
          required
          error={errors.title}
        >
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter course type title"
            error={!!errors.title}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Description"
          required
          error={errors.description}
        >
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter course type description"
            rows={4}
            error={!!errors.description}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Status"
          required
          error={errors.status}
        >
          <Select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={statusOptions}
            error={!!errors.status}
            disabled={isLoading}
          />
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
          >
            {courseType ? 'Update' : 'Create'} Course Type
          </Button>
        </div>
      </VStack>
    </form>
  )
}