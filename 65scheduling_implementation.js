// store/slices/schedulingSlice.js
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import { schedulingApi } from '../api/schedulingApi'

// Entity adapters for Schedule-Service entities
const schedulesAdapter = createEntityAdapter({
  selectId: (schedule) => schedule.id,
  sortComparer: (a, b) => {
    // Sort by date, then by time slot
    const dateCompare = new Date(a.date) - new Date(b.date)
    if (dateCompare === 0) {
      return a.timeSlotStart.localeCompare(b.timeSlotStart)
    }
    return dateCompare
  }
})

const sessionsAdapter = createEntityAdapter({
  selectId: (session) => session.id,
  sortComparer: (a, b) => new Date(b.date) - new Date(a.date) // Latest first
})

const timesheetsAdapter = createEntityAdapter({
  selectId: (timesheet) => timesheet.id,
  sortComparer: (a, b) => new Date(b.date) - new Date(a.date)
})

// Complex async thunks based on your schedule creation workflow
export const createWeeklySchedule = createAsyncThunk(
  'scheduling/createWeeklySchedule',
  async ({ batchCycleId, courseId, weekStart, skipDays, scheduleEntries }, { rejectWithValue }) => {
    try {
      // Calculate available days (excluding skipDays and weekends)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6) // Sunday to Saturday
      
      const availableDays = []
      for (let i = 1; i <= 5; i++) { // Monday to Friday
        const currentDay = new Date(weekStart)
        currentDay.setDate(currentDay.getDate() + i)
        
        const dayName = currentDay.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
        if (!skipDays.includes(dayName)) {
          availableDays.push(currentDay.toISOString().split('T')[0])
        }
      }
      
      // Create schedule entries for each available day
      const schedulePromises = scheduleEntries.flatMap(entry => 
        availableDays.map(date => ({
          batchCycleId,
          courseId,
          moduleId: entry.moduleId,
          staffIds: entry.activity === 'lecture' ? [entry.facultyId] : entry.labMentorIds,
          activity: entry.activity,
          infrastructureId: entry.venueId,
          date,
          timeSlotStart: entry.timeSlotStart,
          timeSlotEnd: entry.timeSlotEnd,
          createdBy: entry.createdBy
        }))
      )
      
      const response = await fetch('/api/scheduling/schedule/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: schedulePromises })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Schedule creation failed')
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkScheduleConflicts = createAsyncThunk(
  'scheduling/checkConflicts',
  async ({ scheduleData }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/scheduling/schedule/check-conflicts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      })
      
      if (!response.ok) throw new Error('Failed to check conflicts')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const submitTimesheetEntry = createAsyncThunk(
  'scheduling/submitTimesheet',
  async (timesheetData, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const staffId = state.auth.user.id
      
      const response = await fetch('/api/scheduling/timesheet', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...timesheetData,
          staffId,
          submittedAt: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Timesheet submission failed')
      }
      
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const approveTimesheets = createAsyncThunk(
  'scheduling/approveTimesheets',
  async ({ timesheetIds, approvalData }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const approverId = state.auth.user.id
      
      const response = await fetch('/api/scheduling/timesheet/approve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timesheetIds,
          ...approvalData,
          approvedBy: approverId,
          approvedAt: new Date().toISOString()
        })
      })
      
      if (!response.ok) throw new Error('Timesheet approval failed')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  schedules: schedulesAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      batchCycleId: null,
      courseId: null,
      week: null,
      activity: 'all',
      staffId: null
    },
    conflicts: [],
    weeklyView: {
      currentWeek: null,
      availableDays: [],
      skipDays: []
    }
  }),
  
  sessions: sessionsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      batchCycleId: null,
      courseId: null,
      status: 'all',
      dateRange: { start: null, end: null }
    },
    activeSession: null
  }),
  
  timesheets: timesheetsAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      staffId: null,
      status: 'all',
      dateRange: { start: null, end: null },
      courseId: null
    },
    currentEntry: {
      date: null,
      entries: []
    },
    pendingApproval: []
  }),
  
  // Schedule creation UI state
  scheduleCreation: {
    step: 1, // 1: Select filters, 2: Configure week, 3: Create entries, 4: Review
    selectedBatchCycle: null,
    selectedCourse: null,
    selectedWeek: null,
    skipDays: [],
    scheduleEntries: [],
    conflicts: [],
    isCreating: false
  }
}

export const schedulingSlice = createSlice({
  name: 'scheduling',
  initialState,
  reducers: {
    // Schedule management
    setScheduleFilters: (state, action) => {
      state.schedules.filters = { ...state.schedules.filters, ...action.payload }
    },
    
    setWeeklyView: (state, action) => {
      const { currentWeek, skipDays } = action.payload
      state.schedules.weeklyView.currentWeek = currentWeek
      state.schedules.weeklyView.skipDays = skipDays
      
      // Calculate available days
      const weekStart = new Date(currentWeek)
      const availableDays = []
      
      for (let i = 1; i <= 5; i++) { // Monday to Friday
        const currentDay = new Date(weekStart)
        currentDay.setDate(currentDay.getDate() + i)
        
        const dayName = currentDay.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
        if (!skipDays.includes(dayName)) {
          availableDays.push({
            date: currentDay.toISOString().split('T')[0],
            dayName: currentDay.toLocaleDateString('en', { weekday: 'long' }),
            dayMonth: currentDay.toLocaleDateString('en', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })
          })
        }
      }
      
      state.schedules.weeklyView.availableDays = availableDays
    },
    
    // Sessions management
    setSessionFilters: (state, action) => {
      state.sessions.filters = { ...state.sessions.filters, ...action.payload }
    },
    
    setActiveSession: (state, action) => {
      state.sessions.activeSession = action.payload
    },
    
    updateSessionStatus: (state, action) => {
      const { sessionId, status } = action.payload
      sessionsAdapter.updateOne(state.sessions, {
        id: sessionId,
        changes: { status }
      })
    },
    
    // Timesheet management
    setTimesheetFilters: (state, action) => {
      state.timesheets.filters = { ...state.timesheets.filters, ...action.payload }
    },
    
    setCurrentTimesheetDate: (state, action) => {
      state.timesheets.currentEntry.date = action.payload
      state.timesheets.currentEntry.entries = []
    },
    
    addTimesheetEntry: (state, action) => {
      state.timesheets.currentEntry.entries.push(action.payload)
    },
    
    updateTimesheetEntry: (state, action) => {
      const { index, entry } = action.payload
      state.timesheets.currentEntry.entries[index] = entry
    },
    
    removeTimesheetEntry: (state, action) => {
      const index = action.payload
      state.timesheets.currentEntry.entries.splice(index, 1)
    },
    
    // Schedule creation workflow
    setScheduleCreationStep: (state, action) => {
      state.scheduleCreation.step = action.payload
    },
    
    setScheduleCreationData: (state, action) => {
      state.scheduleCreation = { ...state.scheduleCreation, ...action.payload }
    },
    
    addScheduleEntry: (state, action) => {
      state.scheduleCreation.scheduleEntries.push(action.payload)
    },
    
    updateScheduleEntry: (state, action) => {
      const { index, entry } = action.payload
      state.scheduleCreation.scheduleEntries[index] = entry
    },
    
    removeScheduleEntry: (state, action) => {
      const index = action.payload
      state.scheduleCreation.scheduleEntries.splice(index, 1)
    },
    
    clearScheduleCreation: (state) => {
      state.scheduleCreation = initialState.scheduleCreation
    },
    
    setScheduleConflicts: (state, action) => {
      state.scheduleCreation.conflicts = action.payload
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Schedules
      .addMatcher(
        schedulingApi.endpoints.getSchedules.matchFulfilled,
        (state, action) => {
          schedulesAdapter.setAll(state.schedules, action.payload)
          state.schedules.loading = false
        }
      )
      .addMatcher(
        schedulingApi.endpoints.createSchedule.matchFulfilled,
        (state, action) => {
          schedulesAdapter.addOne(state.schedules, action.payload)
        }
      )
      .addMatcher(
        schedulingApi.endpoints.updateSchedule.matchFulfilled,
        (state, action) => {
          schedulesAdapter.updateOne(state.schedules, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      
      // Sessions
      .addMatcher(
        schedulingApi.endpoints.getSessions.matchFulfilled,
        (state, action) => {
          sessionsAdapter.setAll(state.sessions, action.payload)
          state.sessions.loading = false
        }
      )
      .addMatcher(
        schedulingApi.endpoints.createSession.matchFulfilled,
        (state, action) => {
          sessionsAdapter.addOne(state.sessions, action.payload)
        }
      )
      
      // Timesheets
      .addMatcher(
        schedulingApi.endpoints.getTimesheets.matchFulfilled,
        (state, action) => {
          timesheetsAdapter.setAll(state.timesheets, action.payload)
          state.timesheets.loading = false
          
          // Extract pending approval timesheets
          state.timesheets.pendingApproval = action.payload.filter(
            timesheet => timesheet.status === 'submitted'
          )
        }
      )
      
      // Complex operations
      .addCase(createWeeklySchedule.pending, (state) => {
        state.scheduleCreation.isCreating = true
      })
      .addCase(createWeeklySchedule.fulfilled, (state, action) => {
        schedulesAdapter.addMany(state.schedules, action.payload.schedules)
        state.scheduleCreation.isCreating = false
        state.scheduleCreation = initialState.scheduleCreation
      })
      .addCase(createWeeklySchedule.rejected, (state, action) => {
        state.scheduleCreation.isCreating = false
        state.schedules.error = action.payload
      })
      
      .addCase(checkScheduleConflicts.fulfilled, (state, action) => {
        state.scheduleCreation.conflicts = action.payload.conflicts || []
      })
      
      .addCase(submitTimesheetEntry.fulfilled, (state, action) => {
        timesheetsAdapter.addOne(state.timesheets, action.payload)
        state.timesheets.currentEntry = initialState.timesheets.currentEntry
      })
      
      .addCase(approveTimesheets.fulfilled, (state, action) => {
        const { timesheetIds, status } = action.payload
        timesheetIds.forEach(id => {
          timesheetsAdapter.updateOne(state.timesheets, {
            id,
            changes: { 
              status, 
              approvedAt: new Date().toISOString(),
              approvedBy: action.payload.approvedBy 
            }
          })
        })
        
        // Update pending approval list
        state.timesheets.pendingApproval = state.timesheets.pendingApproval.filter(
          timesheet => !timesheetIds.includes(timesheet.id)
        )
      })
  }
})

export const {
  setScheduleFilters,
  setWeeklyView,
  setSessionFilters,
  setActiveSession,
  updateSessionStatus,
  setTimesheetFilters,
  setCurrentTimesheetDate,
  addTimesheetEntry,
  updateTimesheetEntry,
  removeTimesheetEntry,
  setScheduleCreationStep,
  setScheduleCreationData,
  addScheduleEntry,
  updateScheduleEntry,
  removeScheduleEntry,
  clearScheduleCreation,
  setScheduleConflicts
} = schedulingSlice.actions

export default schedulingSlice.reducer

// Export adapters and selectors
export const schedulingAdapters = {
  schedules: schedulesAdapter,
  sessions: sessionsAdapter,
  timesheets: timesheetsAdapter
}

export const schedulingSelectors = {
  schedules: schedulesAdapter.getSelectors((state) => state.scheduling.schedules),
  sessions: sessionsAdapter.getSelectors((state) => state.scheduling.sessions),
  timesheets: timesheetsAdapter.getSelectors((state) => state.scheduling.timesheets)
}