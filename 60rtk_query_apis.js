// store/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    credentials: 'include', // Include session cookies
    prepareHeaders: (headers, { getState }) => {
      // Add any additional headers if needed
      headers.set('Content-Type', 'application/json')
      return headers
    }
  }),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => '/me',
      providesTags: ['User'],
      transformResponse: (response) => response.user,
      // Enhanced caching with automatic refetch
      keepUnusedDataFor: 300, // 5 minutes
      refetchOnMountOrArgChange: 30, // 30 seconds
    }),
    
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/profile',
        method: 'PATCH',
        body: userData
      }),
      invalidatesTags: ['User', 'Profile'],
      // Optimistic updates
      onQueryStarted: async (userData, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          authApi.util.updateQueryData('getUserProfile', undefined, (draft) => {
            Object.assign(draft, userData)
          })
        )
        
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      }
    }),
    
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData
      })
    })
  })
})

// store/api/academicApi.js
export const academicApi = createApi({
  reducerPath: 'academicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/academic',
    credentials: 'include'
  }),
  tagTypes: ['CourseType', 'Course', 'Module', 'Subject', 'Section', 'Topic'],
  endpoints: (builder) => ({
    // Course Types
    getCourseTypes: builder.query({
      query: (params = {}) => ({
        url: '/course-types',
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'CourseType', id })), 'CourseType']
          : ['CourseType'],
      transformResponse: (response) => response.data || response,
      // Advanced caching strategy
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Serialize only specific params for caching
        const { page, limit, search, ...otherArgs } = queryArgs
        return { endpointName, args: otherArgs }
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page > 1) {
          currentCache.push(...newItems)
        } else {
          return newItems
        }
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg
      }
    }),
    
    createCourseType: builder.mutation({
      query: (courseType) => ({
        url: '/course-types',
        method: 'POST',
        body: courseType
      }),
      invalidatesTags: ['CourseType'],
      // Pessimistic update with manual cache update
      onQueryStarted: async (courseType, { dispatch, queryFulfilled }) => {
        try {
          const { data: newCourseType } = await queryFulfilled
          
          // Update the course types list cache
          dispatch(
            academicApi.util.updateQueryData('getCourseTypes', {}, (draft) => {
              draft.unshift(newCourseType)
            })
          )
        } catch (error) {
          console.error('Failed to create course type:', error)
        }
      }
    }),
    
    updateCourseType: builder.mutation({
      query: ({ id, ...courseType }) => ({
        url: `/course-types/${id}`,
        method: 'PATCH',
        body: courseType
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CourseType', id }],
      // Optimistic update
      onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          academicApi.util.updateQueryData('getCourseTypes', {}, (draft) => {
            const courseType = draft.find(ct => ct.id === id)
            if (courseType) {
              Object.assign(courseType, patch)
            }
          })
        )
        
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      }
    }),
    
    deleteCourseType: builder.mutation({
      query: (id) => ({
        url: `/course-types/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'CourseType', id }]
    }),
    
    // Courses
    getCourses: builder.query({
      query: (params) => ({
        url: '/courses',
        params
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Course', id })), 'Course']
          : ['Course'],
      transformResponse: (response) => response,
      // Conditional fetching based on permissions
      skip: (params, { getState }) => {
        const permissions = getState().permissions
        return !permissions.accessibleRoutes.includes('/academic-management/courses')
      }
    }),
    
    createCourse: builder.mutation({
      query: (course) => ({
        url: '/courses',
        method: 'POST',
        body: course
      }),
      invalidatesTags: ['Course', 'CourseType']
    }),
    
    updateCourse: builder.mutation({
      query: ({ id, ...course }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body: course
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }]
    }),
    
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }]
    }),
    
    // Modules with hierarchical dependency
    getModules: builder.query({
      query: ({ courseId, ...params }) => ({
        url: `/courses/${courseId}/modules`,
        params
      }),
      providesTags: (result, error, { courseId }) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Module', id })), { type: 'Course', id: courseId }]
          : [{ type: 'Course', id: courseId }]
    }),
    
    createModule: builder.mutation({
      query: ({ courseId, ...module }) => ({
        url: `/courses/${courseId}/modules`,
        method: 'POST',
        body: module
      }),
      invalidatesTags: (result, error, { courseId }) => [
        'Module', 
        { type: 'Course', id: courseId }
      ]
    })
  })
})

// store/api/staffApi.js
export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/staff',
    credentials: 'include'
  }),
  tagTypes: ['Staff', 'Role', 'Assignment'],
  endpoints: (builder) => ({
    getStaff: builder.query({
      query: (params) => ({
        url: '',
        params
      }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Staff', id })), 'Staff']
          : ['Staff'],
      // Advanced filtering and sorting
      transformResponse: (response, meta, arg) => {
        let data = response.data || response
        
        // Apply client-side filtering if needed
        if (arg.role && arg.role !== 'all') {
          data = data.filter(staff => staff.role === arg.role)
        }
        
        // Apply client-side sorting
        if (arg.sortBy) {
          data.sort((a, b) => {
            const aVal = a[arg.sortBy]
            const bVal = b[arg.sortBy]
            const modifier = arg.sortOrder === 'desc' ? -1 : 1
            
            if (typeof aVal === 'string') {
              return aVal.localeCompare(bVal) * modifier
            }
            return (aVal - bVal) * modifier
          })
        }
        
        return { ...response, data }
      }
    }),
    
    createStaff: builder.mutation({
      query: (staff) => ({
        url: '',
        method: 'POST',
        body: staff
      }),
      invalidatesTags: ['Staff']
    }),
    
    updateStaff: builder.mutation({
      query: ({ id, ...staff }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: staff
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Staff', id }]
    }),
    
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Staff', id }]
    }),
    
    assignRole: builder.mutation({
      query: ({ staffId, roleData }) => ({
        url: `/${staffId}/role`,
        method: 'POST',
        body: roleData
      }),
      invalidatesTags: (result, error, { staffId }) => [
        { type: 'Staff', id: staffId },
        'Role',
        'Assignment'
      ]
    }),
    
    assignCoordinator: builder.mutation({
      query: ({ staffId, courseIds }) => ({
        url: `/${staffId}/coordinator`,
        method: 'POST',
        body: { courseIds }
      }),
      invalidatesTags: ['Assignment', 'Course']
    })
  })
})

// Export hooks
export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation
} = authApi

export const {
  useGetCourseTypesQuery,
  useCreateCourseTypeMutation,
  useUpdateCourseTypeMutation,
  useDeleteCourseTypeMutation,
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetModulesQuery,
  useCreateModuleMutation
} = academicApi

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useAssignRoleMutation,
  useAssignCoordinatorMutation
} = staffApi