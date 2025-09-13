// store/api/schedulingApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const schedulingApi = createApi({
  reducerPath: 'schedulingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/scheduling',
    credentials: 'include'
  }),
  tagTypes: ['Schedule', 'Session', 'Timesheet', 'Video'],
  endpoints: (builder) => ({
    // Schedule endpoints
    getSchedules: builder.query({
      query: (params) => ({
        url: '/schedule',
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Schedule', id })), 'Schedule']
          : ['Schedule']
    }),
    
    createSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/schedule',
        method: 'POST',
        body: schedule
      }),
      invalidatesTags: ['Schedule']
    }),
    
    createBulkSchedule: builder.mutation({
      query: (scheduleData) => ({
        url: '/schedule/bulk',
        method: 'POST',
        body: scheduleData
      }),
      invalidatesTags: ['Schedule']
    }),
    
    updateSchedule: builder.mutation({
      query: ({ id, ...schedule }) => ({
        url: `/schedule/${id}`,
        method: 'PATCH',
        body: schedule
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Schedule', id }]
    }),
    
    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `/schedule/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Schedule', id }]
    }),
    
    checkScheduleConflicts: builder.mutation({
      query: (scheduleData) => ({
        url: '/schedule/check-conflicts',
        method: 'POST',
        body: scheduleData
      })
    }),
    
    // Session endpoints
    getSessions: builder.query({
      query: (params) => ({
        url: '/sessions',
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Session', id })), 'Session']
          : ['Session']
    }),
    
    createSession: builder.mutation({
      query: (session) => ({
        url: '/sessions',
        method: 'POST',
        body: session
      }),
      invalidatesTags: ['Session']
    }),
    
    updateSession: builder.mutation({
      query: ({ id, ...session }) => ({
        url: `/sessions/${id}`,
        method: 'PATCH',
        body: session
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }]
    }),
    
    // Timesheet endpoints
    getTimesheets: builder.query({
      query: (params) => ({
        url: '/timesheets',
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Timesheet', id })), 'Timesheet']
          : ['Timesheet']
    }),
    
    submitTimesheet: builder.mutation({
      query: (timesheet) => ({
        url: '/timesheets',
        method: 'POST',
        body: timesheet
      }),
      invalidatesTags: ['Timesheet']
    }),
    
    approveTimesheet: builder.mutation({
      query: ({ id, approvalData }) => ({
        url: `/timesheets/${id}/approve`,
        method: 'POST',
        body: approvalData
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Timesheet', id }]
    }),
    
    // Video endpoints
    getVideos: builder.query({
      query: (params) => ({
        url: '/videos',
        params
      }),
      providesTags: ['Video']
    }),
    
    createVideo: builder.mutation({
      query: (video) => ({
        url: '/videos',
        method: 'POST',
        body: video
      }),
      invalidatesTags: ['Video']
    })
  })
})

// store/api/reportsApi.js
export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/reports',
    credentials: 'include'
  }),
  tagTypes: ['Report', 'Certificate'],
  endpoints: (builder) => ({
    generateScheduleReport: builder.mutation({
      query: (reportParams) => ({
        url: '/schedule',
        method: 'POST',
        body: reportParams
      }),
      invalidatesTags: ['Report']
    }),
    
    getReports: builder.query({
      query: (params) => ({
        url: '',
        params
      }),
      providesTags: ['Report']
    }),
    
    downloadReport: builder.mutation({
      query: (reportId) => ({
        url: `/${reportId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob()
      })
    }),
    
    generateCertificate: builder.mutation({
      query: (certificateData) => ({
        url: '/certificates',
        method: 'POST',
        body: certificateData
      }),
      invalidatesTags: ['Certificate']
    }),
    
    getCertificates: builder.query({
      query: (params) => ({
        url: '/certificates',
        params
      }),
      providesTags: ['Certificate']
    })
  })
})

// store/selectors/schedulingSelectors.js
import { createSelector } from '@reduxjs/toolkit'
import { schedulingSelectors } from '../slices/schedulingSlice'

// Base selectors
export const selectSchedulingState = (state) => state.scheduling
export const selectScheduleFilters = (state) => state.scheduling.schedules.filters
export const selectWeeklyView = (state) => state.scheduling.schedules.weeklyView
export const selectScheduleCreation = (state) => state.scheduling.scheduleCreation

// Complex schedule selectors
export const selectSchedulesByWeek = createSelector(
  [schedulingSelectors.schedules.selectAll, selectWeeklyView],
  (schedules, weeklyView) => {
    if (!weeklyView.currentWeek) return {}
    
    const weekStart = new Date(weeklyView.currentWeek)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    return schedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.date)
        return scheduleDate >= weekStart && scheduleDate <= weekEnd
      })
      .reduce((acc, schedule) => {
        if (!acc[schedule.date]) {
          acc[schedule.date] = []
        }
        acc[schedule.date].push(schedule)
        return acc
      }, {})
  }
)

export const selectSchedulesByInfrastructure = createSelector(
  [schedulingSelectors.schedules.selectAll],
  (schedules) => {
    return schedules.reduce((acc, schedule) => {
      if (!acc[schedule.infrastructureId]) {
        acc[schedule.infrastructureId] = []
      }
      acc[schedule.infrastructureId].push(schedule)
      return acc
    }, {})
  }
)

export const selectStaffSchedule = createSelector(
  [schedulingSelectors.schedules.selectAll, (state, staffId) => staffId],
  (schedules, staffId) => {
    return schedules.filter(schedule => 
      schedule.staffIds && schedule.staffIds.includes(staffId)
    )
  }
)

// Session selectors
export const selectUpcomingSessions = createSelector(
  [schedulingSelectors.sessions.selectAll],
  (sessions) => {
    const now = new Date()
    return sessions
      .filter(session => new Date(session.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10) // Next 10 sessions
  }
)

export const selectSessionsByStatus = createSelector(
  [schedulingSelectors.sessions.selectAll],
  (sessions) => {
    return sessions.reduce((acc, session) => {
      if (!acc[session.status]) {
        acc[session.status] = []
      }
      acc[session.status].push(session)
      return acc
    }, {})
  }
)

// Timesheet selectors
export const selectPendingTimesheets = createSelector(
  [schedulingSelectors.timesheets.selectAll],
  (timesheets) => {
    return timesheets.filter(timesheet => timesheet.status === 'submitted')
  }
)

export const selectTimesheetsByStaff = createSelector(
  [schedulingSelectors.timesheets.selectAll, (state, staffId) => staffId],
  (timesheets, staffId) => {
    return timesheets.filter(timesheet => timesheet.staffId === staffId)
  }
)

export const selectTimesheetStats = createSelector(
  [schedulingSelectors.timesheets.selectAll],
  (timesheets) => {
    const stats = {
      total: timesheets.length,
      submitted: 0,
      approved: 0,
      rejected: 0,
      totalHours: 0
    }
    
    timesheets.forEach(timesheet => {
      stats[timesheet.status] = (stats[timesheet.status] || 0) + 1
      stats.totalHours += parseFloat(timesheet.time || 0)
    })
    
    return stats
  }
)

// store/selectors/infrastructureSelectors.js
export const selectInfrastructureState = (state) => state.infrastructure
export const selectCurrentBatchCycle = (state) => {
  const batchCycles = infrastructureSelectors.batchCycles.selectAll(state)
  const currentId = state.infrastructure.batchCycles.currentBatchCycle
  return batchCycles.find(cycle => cycle.id === currentId)
}

export const selectActivePremises = createSelector(
  [infrastructureSelectors.premises.selectAll],
  (premises) => {
    return premises.filter(premise => premise.active)
  }
)

export const selectInfrastructureByPremise = createSelector(
  [infrastructureSelectors.infrastructures.selectAll, (state, premiseId) => premiseId],
  (infrastructures, premiseId) => {
    return infrastructures.filter(infra => infra.premiseId === premiseId)
  }
)

export const selectInfrastructureCapacityStats = createSelector(
  [infrastructureSelectors.infrastructures.selectAll],
  (infrastructures) => {
    const stats = {
      total: infrastructures.length,
      totalCapacity: 0,
      averageCapacity: 0,
      byType: {}
    }
    
    infrastructures.forEach(infra => {
      stats.totalCapacity += infra.capacity || 0
      
      if (!stats.byType[infra.type]) {
        stats.byType[infra.type] = { count: 0, capacity: 0 }
      }
      stats.byType[infra.type].count += 1
      stats.byType[infra.type].capacity += infra.capacity || 0
    })
    
    stats.averageCapacity = stats.total > 0 ? stats.totalCapacity / stats.total : 0
    
    return stats
  }
)

// Export all API hooks
export const {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useCreateBulkScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useCheckScheduleConflictsMutation,
  useGetSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useGetTimesheetsQuery,
  useSubmitTimesheetMutation,
  useApproveTimesheetMutation,
  useGetVideosQuery,
  useCreateVideoMutation
} = schedulingApi

export const {
  useGenerateScheduleReportMutation,
  useGetReportsQuery,
  useDownloadReportMutation,
  useGenerateCertificateMutation,
  useGetCertificatesQuery
} = reportsApi