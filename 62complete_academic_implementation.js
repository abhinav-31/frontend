// store/slices/academicSlice.js
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import { academicApi } from '../api/academicApi'

// Entity adapters for normalized state management
const courseTypesAdapter = createEntityAdapter({
  selectId: (courseType) => courseType.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const coursesAdapter = createEntityAdapter({
  selectId: (course) => course.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const modulesAdapter = createEntityAdapter({
  selectId: (module) => module.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const subjectsAdapter = createEntityAdapter({
  selectId: (subject) => subject.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const sectionsAdapter = createEntityAdapter({
  selectId: (section) => section.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const topicsAdapter = createEntityAdapter({
  selectId: (topic) => topic.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const courseGroupsAdapter = createEntityAdapter({
  selectId: (group) => group.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

// Async thunks for complex operations
export const createCourseWithHierarchy = createAsyncThunk(
  'academic/createCourseWithHierarchy',
  async ({ courseData, modules = [] }, { dispatch, rejectWithValue }) => {
    try {
      // Create course first
      const courseResult = await dispatch(academicApi.endpoints.createCourse.initiate(courseData)).unwrap()
      
      // Create associated modules if provided
      const modulePromises = modules.map(moduleData => 
        dispatch(academicApi.endpoints.createModule.initiate({
          courseId: courseResult.id,
          ...moduleData
        })).unwrap()
      )
      
      const createdModules = await Promise.all(modulePromises)
      
      return {
        course: courseResult,
        modules: createdModules
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const bulkUpdateCourseStatus = createAsyncThunk(
  'academic/bulkUpdateCourseStatus',
  async ({ courseIds, status }, { dispatch, rejectWithValue }) => {
    try {
      const updatePromises = courseIds.map(courseId =>
        dispatch(academicApi.endpoints.updateCourse.initiate({
          id: courseId,
          status
        })).unwrap()
      )
      
      const updatedCourses = await Promise.all(updatePromises)
      return updatedCourses
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  // Entity states
  courseTypes: courseTypesAdapter.getInitialState({
    loading: false,
    error: null,
    lastUpdated: null,
    filters: {
      status: 'all',
      search: ''
    }
  }),
  
  courses: coursesAdapter.getInitialState({
    loading: false,
    error: null,
    lastUpdated: null,
    filters: {
      batchCycleId: null,
      courseTypeId: null,
      premiseId: null,
      status: 'all',
      search: ''
    },
    pagination: {
      page: 1,
      limit: 25,
      total: 0
    }
  }),
  
  modules: modulesAdapter.getInitialState({
    loading: false,
    error: null,
    lastUpdated: null,
    filters: {
      courseId: null,
      batchCycleId: null,
      status: 'all',
      search: ''
    }
  }),
  
  subjects: subjectsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      moduleId: null,
      courseId: null,
      status: 'all',
      search: ''
    }
  }),
  
  sections: sectionsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      subjectId: null,
      moduleId: null,
      courseId: null,
      status: 'all',
      search: ''
    }
  }),
  
  topics: topicsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      sectionId: null,
      subjectId: null,
      status: 'all',
      search: ''
    }
  }),
  
  courseGroups: courseGroupsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      courseId: null,
      batchCycleId: null,
      status: 'all',
      search: ''
    }
  }),
  
  // UI state
  selectedCourse: null,
  selectedModule: null,
  hierarchyView: {
    expanded: {},
    selectedPath: []
  },
  bulkOperations: {
    selectedItems: [],
    operation: null,
    loading: false
  }
}

export const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    // Course Types
    setCourseTypeFilters: (state, action) => {
      state.courseTypes.filters = { ...state.courseTypes.filters, ...action.payload }
    },
    
    clearCourseTypeFilters: (state) => {
      state.courseTypes.filters = initialState.courseTypes.filters
    },
    
    // Courses
    setCourseFilters: (state, action) => {
      state.courses.filters = { ...state.courses.filters, ...action.payload }
    },
    
    clearCourseFilters: (state) => {
      state.courses.filters = initialState.courses.filters
    },
    
    setCoursePagination: (state, action) => {
      state.courses.pagination = { ...state.courses.pagination, ...action.payload }
    },
    
    selectCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    
    // Modules
    setModuleFilters: (state, action) => {
      state.modules.filters = { ...state.modules.filters, ...action.payload }
    },
    
    selectModule: (state, action) => {
      state.selectedModule = action.payload
    },
    
    // Hierarchy management
    toggleHierarchyExpansion: (state, action) => {
      const { entityType, entityId } = action.payload
      const key = `${entityType}_${entityId}`
      state.hierarchyView.expanded[key] = !state.hierarchyView.expanded[key]
    },
    
    setSelectedPath: (state, action) => {
      state.hierarchyView.selectedPath = action.payload
    },
    
    // Bulk operations
    toggleBulkSelection: (state, action) => {
      const itemId = action.payload
      const selectedItems = state.bulkOperations.selectedItems
      const index = selectedItems.indexOf(itemId)
      
      if (index > -1) {
        selectedItems.splice(index, 1)
      } else {
        selectedItems.push(itemId)
      }
    },
    
    selectAllItems: (state, action) => {
      state.bulkOperations.selectedItems = action.payload
    },
    
    clearBulkSelection: (state) => {
      state.bulkOperations.selectedItems = []
      state.bulkOperations.operation = null
    },
    
    setBulkOperation: (state, action) => {
      state.bulkOperations.operation = action.payload
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Course Types
      .addMatcher(
        academicApi.endpoints.getCourseTypes.matchFulfilled,
        (state, action) => {
          courseTypesAdapter.setAll(state.courseTypes, action.payload)
          state.courseTypes.loading = false
          state.courseTypes.lastUpdated = Date.now()
        }
      )
      .addMatcher(
        academicApi.endpoints.createCourseType.matchFulfilled,
        (state, action) => {
          courseTypesAdapter.addOne(state.courseTypes, action.payload)
        }
      )
      .addMatcher(
        academicApi.endpoints.updateCourseType.matchFulfilled,
        (state, action) => {
          courseTypesAdapter.updateOne(state.courseTypes, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      .addMatcher(
        academicApi.endpoints.deleteCourseType.matchFulfilled,
        (state, action) => {
          courseTypesAdapter.removeOne(state.courseTypes, action.meta.arg.originalArgs)
        }
      )
      
      // Courses
      .addMatcher(
        academicApi.endpoints.getCourses.matchFulfilled,
        (state, action) => {
          const { data, pagination } = action.payload
          coursesAdapter.setAll(state.courses, data)
          state.courses.pagination = { ...state.courses.pagination, ...pagination }
          state.courses.loading = false
          state.courses.lastUpdated = Date.now()
        }
      )
      .addMatcher(
        academicApi.endpoints.createCourse.matchFulfilled,
        (state, action) => {
          coursesAdapter.addOne(state.courses, action.payload)
        }
      )
      .addMatcher(
        academicApi.endpoints.updateCourse.matchFulfilled,
        (state, action) => {
          coursesAdapter.updateOne(state.courses, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      .addMatcher(
        academicApi.endpoints.deleteCourse.matchFulfilled,
        (state, action) => {
          coursesAdapter.removeOne(state.courses, action.meta.arg.originalArgs)
        }
      )
      
      // Complex thunks
      .addCase(createCourseWithHierarchy.pending, (state) => {
        state.courses.loading = true
      })
      .addCase(createCourseWithHierarchy.fulfilled, (state, action) => {
        const { course, modules } = action.payload
        coursesAdapter.addOne(state.courses, course)
        modulesAdapter.addMany(state.modules, modules)
        state.courses.loading = false
      })
      .addCase(createCourseWithHierarchy.rejected, (state, action) => {
        state.courses.loading = false
        state.courses.error = action.payload
      })
      
      .addCase(bulkUpdateCourseStatus.pending, (state) => {
        state.bulkOperations.loading = true
      })
      .addCase(bulkUpdateCourseStatus.fulfilled, (state, action) => {
        action.payload.forEach(updatedCourse => {
          coursesAdapter.updateOne(state.courses, {
            id: updatedCourse.id,
            changes: updatedCourse
          })
        })
        state.bulkOperations.loading = false
        state.bulkOperations.selectedItems = []
      })
      .addCase(bulkUpdateCourseStatus.rejected, (state, action) => {
        state.bulkOperations.loading = false
        state.courses.error = action.payload
      })
  }
})

export const {
  setCourseTypeFilters,
  clearCourseTypeFilters,
  setCourseFilters,
  clearCourseFilters,
  setCoursePagination,
  selectCourse,
  setModuleFilters,
  selectModule,
  toggleHierarchyExpansion,
  setSelectedPath,
  toggleBulkSelection,
  selectAllItems,
  clearBulkSelection,
  setBulkOperation
} = academicSlice.actions

export default academicSlice.reducer

// store/adapters/academicAdapter.js
export const academicAdapters = {
  courseTypes: courseTypesAdapter,
  courses: coursesAdapter,
  modules: modulesAdapter,
  subjects: subjectsAdapter,
  sections: sectionsAdapter,
  topics: topicsAdapter,
  courseGroups: courseGroupsAdapter
}

// Entity selectors
export const academicSelectors = {
  courseTypes: courseTypesAdapter.getSelectors((state) => state.academic.courseTypes),
  courses: coursesAdapter.getSelectors((state) => state.academic.courses),
  modules: modulesAdapter.getSelectors((state) => state.academic.modules),
  subjects: subjectsAdapter.getSelectors((state) => state.academic.subjects),
  sections: sectionsAdapter.getSelectors((state) => state.academic.sections),
  topics: topicsAdapter.getSelectors((state) => state.academic.topics),
  courseGroups: courseGroupsAdapter.getSelectors((state) => state.academic.courseGroups)
}