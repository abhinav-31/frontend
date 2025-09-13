// store/slices/staffSlice.js
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import { staffApi } from '../api/staffApi'

// Entity adapters for User-Service entities
const staffAdapter = createEntityAdapter({
  selectId: (staff) => staff.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const menuItemsAdapter = createEntityAdapter({
  selectId: (menuItem) => menuItem.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const roleBasedMenuAdapter = createEntityAdapter({
  selectId: (roleMenu) => `${roleMenu.role}_${roleMenu.menuItemId}`,
  sortComparer: (a, b) => a.role.localeCompare(b.role)
})

const staffMenuAccessAdapter = createEntityAdapter({
  selectId: (access) => `${access.staffId}_${access.menuItemId}`,
  sortComparer: (a, b) => a.staffId - b.staffId
})

const courseAssignmentsAdapter = createEntityAdapter({
  selectId: (assignment) => `${assignment.courseId}_${assignment.staffId}`,
  sortComparer: (a, b) => a.courseId - b.courseId
})

// Complex async thunks
export const createStaffWithPermissions = createAsyncThunk(
  'staff/createStaffWithPermissions',
  async ({ staffData, menuPermissions = [] }, { dispatch, rejectWithValue }) => {
    try {
      const staffResult = await dispatch(staffApi.endpoints.createStaff.initiate(staffData)).unwrap()
      
      // Set menu permissions for the new staff
      const permissionPromises = menuPermissions.map(permission =>
        dispatch(staffApi.endpoints.setStaffMenuAccess.initiate({
          staffId: staffResult.id,
          menuItemId: permission.menuItemId,
          accessType: permission.accessType
        })).unwrap()
      )
      
      await Promise.all(permissionPromises)
      
      return staffResult
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const assignCourseCoordinator = createAsyncThunk(
  'staff/assignCourseCoordinator',
  async ({ staffId, courseIds }, { dispatch, rejectWithValue }) => {
    try {
      const assignmentPromises = courseIds.map(courseId =>
        dispatch(staffApi.endpoints.assignCoordinator.initiate({
          staffId,
          courseId
        })).unwrap()
      )
      
      const assignments = await Promise.all(assignmentPromises)
      return { staffId, assignments }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const bulkUpdateStaffRole = createAsyncThunk(
  'staff/bulkUpdateStaffRole',
  async ({ staffIds, roleData }, { dispatch, rejectWithValue }) => {
    try {
      const updatePromises = staffIds.map(staffId =>
        dispatch(staffApi.endpoints.assignRole.initiate({
          staffId,
          roleData
        })).unwrap()
      )
      
      await Promise.all(updatePromises)
      return { staffIds, roleData }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  staff: staffAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      role: 'all',
      type: 'all', // IN-House/Visiting
      courseDesignation: null,
      status: 'all',
      search: ''
    },
    selectedStaff: null
  }),
  
  menuItems: menuItemsAdapter.getInitialState({
    loading: false,
    error: null
  }),
  
  roleBasedMenu: roleBasedMenuAdapter.getInitialState({
    loading: false,
    error: null
  }),
  
  staffMenuAccess: staffMenuAccessAdapter.getInitialState({
    loading: false,
    error: null
  }),
  
  courseAssignments: courseAssignmentsAdapter.getInitialState({
    loading: false,
    error: null
  }),
  
  // Role management UI state
  roleManagement: {
    selectedRole: null,
    availableMenuItems: [],
    assignedMenuItems: [],
    bulkOperations: {
      selectedStaffIds: [],
      operation: null,
      loading: false
    }
  }
}

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Staff management
    setStaffFilters: (state, action) => {
      state.staff.filters = { ...state.staff.filters, ...action.payload }
    },
    
    selectStaff: (state, action) => {
      state.staff.selectedStaff = action.payload
    },
    
    updateStaffStatus: (state, action) => {
      const { staffId, status } = action.payload
      staffAdapter.updateOne(state.staff, {
        id: staffId,
        changes: { status }
      })
    },
    
    // Role-based menu management
    setSelectedRole: (state, action) => {
      state.roleManagement.selectedRole = action.payload
    },
    
    setAvailableMenuItems: (state, action) => {
      state.roleManagement.availableMenuItems = action.payload
    },
    
    setAssignedMenuItems: (state, action) => {
      state.roleManagement.assignedMenuItems = action.payload
    },
    
    toggleMenuItemAccess: (state, action) => {
      const { roleMenuId, accessStatus } = action.payload
      roleBasedMenuAdapter.updateOne(state.roleBasedMenu, {
        id: roleMenuId,
        changes: { accessStatus }
      })
    },
    
    // Staff menu exceptions (StaffMenuAccess)
    setStaffMenuException: (state, action) => {
      const { staffId, menuItemId, accessType } = action.payload
      const id = `${staffId}_${menuItemId}`
      
      staffMenuAccessAdapter.upsertOne(state.staffMenuAccess, {
        id,
        staffId,
        menuItemId,
        accessType
      })
    },
    
    removeStaffMenuException: (state, action) => {
      const { staffId, menuItemId } = action.payload
      const id = `${staffId}_${menuItemId}`
      staffMenuAccessAdapter.removeOne(state.staffMenuAccess, id)
    },
    
    // Bulk operations
    toggleBulkStaffSelection: (state, action) => {
      const staffId = action.payload
      const selectedIds = state.roleManagement.bulkOperations.selectedStaffIds
      const index = selectedIds.indexOf(staffId)
      
      if (index > -1) {
        selectedIds.splice(index, 1)
      } else {
        selectedIds.push(staffId)
      }
    },
    
    selectAllStaff: (state, action) => {
      state.roleManagement.bulkOperations.selectedStaffIds = action.payload
    },
    
    clearBulkStaffSelection: (state) => {
      state.roleManagement.bulkOperations.selectedStaffIds = []
      state.roleManagement.bulkOperations.operation = null
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Staff CRUD operations
      .addMatcher(
        staffApi.endpoints.getStaff.matchFulfilled,
        (state, action) => {
          staffAdapter.setAll(state.staff, action.payload.data || action.payload)
          state.staff.loading = false
        }
      )
      .addMatcher(
        staffApi.endpoints.createStaff.matchFulfilled,
        (state, action) => {
          staffAdapter.addOne(state.staff, action.payload)
        }
      )
      .addMatcher(
        staffApi.endpoints.updateStaff.matchFulfilled,
        (state, action) => {
          staffAdapter.updateOne(state.staff, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      .addMatcher(
        staffApi.endpoints.deleteStaff.matchFulfilled,
        (state, action) => {
          staffAdapter.removeOne(state.staff, action.meta.arg.originalArgs)
        }
      )
      
      // Menu Items
      .addMatcher(
        staffApi.endpoints.getMenuItems.matchFulfilled,
        (state, action) => {
          menuItemsAdapter.setAll(state.menuItems, action.payload)
          state.menuItems.loading = false
        }
      )
      
      // Role-based Menu
      .addMatcher(
        staffApi.endpoints.getRoleBasedMenu.matchFulfilled,
        (state, action) => {
          roleBasedMenuAdapter.setAll(state.roleBasedMenu, action.payload)
        }
      )
      
      // Course Assignments
      .addMatcher(
        staffApi.endpoints.getCourseAssignments.matchFulfilled,
        (state, action) => {
          courseAssignmentsAdapter.setAll(state.courseAssignments, action.payload)
        }
      )
      
      // Complex operations
      .addCase(createStaffWithPermissions.fulfilled, (state, action) => {
        staffAdapter.addOne(state.staff, action.payload)
      })
      
      .addCase(assignCourseCoordinator.fulfilled, (state, action) => {
        const { staffId, assignments } = action.payload
        courseAssignmentsAdapter.addMany(state.courseAssignments, assignments)
        
        // Update staff record with course assignments
        staffAdapter.updateOne(state.staff, {
          id: staffId,
          changes: {
            courseDesignation: assignments.map(a => a.courseCode)
          }
        })
      })
      
      .addCase(bulkUpdateStaffRole.pending, (state) => {
        state.roleManagement.bulkOperations.loading = true
      })
      .addCase(bulkUpdateStaffRole.fulfilled, (state, action) => {
        const { staffIds, roleData } = action.payload
        staffIds.forEach(staffId => {
          staffAdapter.updateOne(state.staff, {
            id: staffId,
            changes: { role: roleData.role }
          })
        })
        state.roleManagement.bulkOperations.loading = false
        state.roleManagement.bulkOperations.selectedStaffIds = []
      })
  }
})

export const {
  setStaffFilters,
  selectStaff,
  updateStaffStatus,
  setSelectedRole,
  setAvailableMenuItems,
  setAssignedMenuItems,
  toggleMenuItemAccess,
  setStaffMenuException,
  removeStaffMenuException,
  toggleBulkStaffSelection,
  selectAllStaff,
  clearBulkStaffSelection
} = staffSlice.actions

export default staffSlice.reducer

// store/slices/studentsSlice.js
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import { studentsApi } from '../api/studentsApi'

const studentsAdapter = createEntityAdapter({
  selectId: (student) => student.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

const courseGroupsAdapter = createEntityAdapter({
  selectId: (group) => group.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

// Complex operations for student management
export const importStudentsFromFile = createAsyncThunk(
  'students/importFromFile',
  async ({ file, batchCycleId, courseId }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('batchCycleId', batchCycleId)
      formData.append('courseId', courseId)
      
      const response = await fetch('/api/students/import', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Import failed')
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const assignStudentsToCourseGroup = createAsyncThunk(
  'students/assignToCourseGroup',
  async ({ studentIds, courseGroupId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await dispatch(studentsApi.endpoints.assignStudentsToGroup.initiate({
        studentIds,
        courseGroupId
      })).unwrap()
      
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const studentsInitialState = {
  students: studentsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      batchCycleId: null,
      courseId: null,
      courseGroupId: null,
      search: ''
    },
    importStatus: {
      isImporting: false,
      progress: 0,
      errors: [],
      successCount: 0
    }
  }),
  
  courseGroups: courseGroupsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      batchCycleId: null,
      courseId: null,
      status: 'all'
    }
  }),
  
  // Student assignment UI state
  groupAssignment: {
    selectedStudents: [],
    availableGroups: [],
    assignmentMode: 'manual' // 'manual' | 'auto'
  }
}

export const studentsSlice = createSlice({
  name: 'students',
  initialState: studentsInitialState,
  reducers: {
    // Student filters
    setStudentFilters: (state, action) => {
      state.students.filters = { ...state.students.filters, ...action.payload }
    },
    
    // Course Group filters
    setCourseGroupFilters: (state, action) => {
      state.courseGroups.filters = { ...state.courseGroups.filters, ...action.payload }
    },
    
    // Student selection for group assignment
    toggleStudentSelection: (state, action) => {
      const studentId = action.payload
      const selectedStudents = state.groupAssignment.selectedStudents
      const index = selectedStudents.indexOf(studentId)
      
      if (index > -1) {
        selectedStudents.splice(index, 1)
      } else {
        selectedStudents.push(studentId)
      }
    },
    
    selectAllStudents: (state, action) => {
      state.groupAssignment.selectedStudents = action.payload
    },
    
    clearStudentSelection: (state) => {
      state.groupAssignment.selectedStudents = []
    },
    
    setAssignmentMode: (state, action) => {
      state.groupAssignment.assignmentMode = action.payload
    },
    
    setAvailableGroups: (state, action) => {
      state.groupAssignment.availableGroups = action.payload
    },
    
    // Import status management
    setImportProgress: (state, action) => {
      state.students.importStatus.progress = action.payload
    },
    
    addImportError: (state, action) => {
      state.students.importStatus.errors.push(action.payload)
    },
    
    clearImportStatus: (state) => {
      state.students.importStatus = {
        isImporting: false,
        progress: 0,
        errors: [],
        successCount: 0
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Students CRUD
      .addMatcher(
        studentsApi.endpoints.getStudents.matchFulfilled,
        (state, action) => {
          studentsAdapter.setAll(state.students, action.payload.data || action.payload)
          state.students.loading = false
        }
      )
      .addMatcher(
        studentsApi.endpoints.createStudent.matchFulfilled,
        (state, action) => {
          studentsAdapter.addOne(state.students, action.payload)
        }
      )
      .addMatcher(
        studentsApi.endpoints.updateStudent.matchFulfilled,
        (state, action) => {
          studentsAdapter.updateOne(state.students, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      
      // Course Groups
      .addMatcher(
        studentsApi.endpoints.getCourseGroups.matchFulfilled,
        (state, action) => {
          courseGroupsAdapter.setAll(state.courseGroups, action.payload)
          state.courseGroups.loading = false
        }
      )
      .addMatcher(
        studentsApi.endpoints.createCourseGroup.matchFulfilled,
        (state, action) => {
          courseGroupsAdapter.addOne(state.courseGroups, action.payload)
        }
      )
      
      // Complex operations
      .addCase(importStudentsFromFile.pending, (state) => {
        state.students.importStatus.isImporting = true
        state.students.importStatus.progress = 0
        state.students.importStatus.errors = []
      })
      .addCase(importStudentsFromFile.fulfilled, (state, action) => {
        const { students, successCount, errors } = action.payload
        studentsAdapter.addMany(state.students, students)
        state.students.importStatus = {
          isImporting: false,
          progress: 100,
          errors,
          successCount
        }
      })
      .addCase(importStudentsFromFile.rejected, (state, action) => {
        state.students.importStatus.isImporting = false
        state.students.importStatus.errors.push(action.payload)
      })
      
      .addCase(assignStudentsToCourseGroup.fulfilled, (state, action) => {
        const { assignments } = action.payload
        assignments.forEach(assignment => {
          studentsAdapter.updateOne(state.students, {
            id: assignment.studentId,
            changes: { courseGroupId: assignment.courseGroupId }
          })
        })
        state.groupAssignment.selectedStudents = []
      })
  }
})

export const {
  setStudentFilters,
  setCourseGroupFilters,
  toggleStudentSelection,
  selectAllStudents,
  clearStudentSelection,
  setAssignmentMode,
  setAvailableGroups,
  setImportProgress,
  addImportError,
  clearImportStatus
} = studentsSlice.actions

export default studentsSlice.reducer

// Export adapters and selectors
export const staffAdapters = {
  staff: staffAdapter,
  menuItems: menuItemsAdapter,
  roleBasedMenu: roleBasedMenuAdapter,
  staffMenuAccess: staffMenuAccessAdapter,
  courseAssignments: courseAssignmentsAdapter
}

export const studentsAdapters = {
  students: studentsAdapter,
  courseGroups: courseGroupsAdapter
}

export const staffSelectors = {
  staff: staffAdapter.getSelectors((state) => state.staff.staff),
  menuItems: menuItemsAdapter.getSelectors((state) => state.staff.menuItems),
  roleBasedMenu: roleBasedMenuAdapter.getSelectors((state) => state.staff.roleBasedMenu),
  staffMenuAccess: staffMenuAccessAdapter.getSelectors((state) => state.staff.staffMenuAccess),
  courseAssignments: courseAssignmentsAdapter.getSelectors((state) => state.staff.courseAssignments)
}

export const studentsSelectors = {
  students: studentsAdapter.getSelectors((state) => state.students.students),
  courseGroups: courseGroupsAdapter.getSelectors((state) => state.students.courseGroups)
}