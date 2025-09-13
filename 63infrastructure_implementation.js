// store/slices/infrastructureSlice.js
import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import { infrastructureApi } from '../api/infrastructureApi'

// Entity adapters based on your document structure
const batchCyclesAdapter = createEntityAdapter({
  selectId: (batchCycle) => batchCycle.id,
  sortComparer: (a, b) => new Date(b.startDate) - new Date(a.startDate) // Latest first
})

const premisesAdapter = createEntityAdapter({
  selectId: (premise) => premise.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const infrastructuresAdapter = createEntityAdapter({
  selectId: (infrastructure) => infrastructure.id,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

// Complex async thunks
export const createPremiseWithInfrastructure = createAsyncThunk(
  'infrastructure/createPremiseWithInfrastructure',
  async ({ premiseData, infrastructures = [] }, { dispatch, rejectWithValue }) => {
    try {
      const premiseResult = await dispatch(infrastructureApi.endpoints.createPremise.initiate(premiseData)).unwrap()
      
      const infrastructurePromises = infrastructures.map(infraData => 
        dispatch(infrastructureApi.endpoints.createInfrastructure.initiate({
          ...infraData,
          premiseId: premiseResult.id
        })).unwrap()
      )
      
      const createdInfrastructures = await Promise.all(infrastructurePromises)
      
      return {
        premise: premiseResult,
        infrastructures: createdInfrastructures
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkInfrastructureAvailability = createAsyncThunk(
  'infrastructure/checkAvailability',
  async ({ infrastructureId, startTime, endTime, date }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/infrastructure/${infrastructureId}/availability`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime, endTime, date })
      })
      
      if (!response.ok) throw new Error('Failed to check availability')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  batchCycles: batchCyclesAdapter.getInitialState({
    loading: false,
    error: null,
    currentBatchCycle: null,
    filters: {
      status: 'all',
      year: new Date().getFullYear(),
      search: ''
    }
  }),
  
  premises: premisesAdapter.getInitialState({
    loading: false,
    error: null,
    filters: {
      type: 'all',
      active: true,
      search: ''
    }
  }),
  
  infrastructures: infrastructuresAdapter.getInitialState({
    loading: false,
    error: null,
    availability: {},
    filters: {
      premiseId: null,
      type: 'all',
      capacity: null,
      search: ''
    }
  }),
  
  // UI state for capacity management
  capacityManagement: {
    selectedInfrastructure: null,
    bookingCalendar: {},
    utilizationStats: {}
  }
}

export const infrastructureSlice = createSlice({
  name: 'infrastructure',
  initialState,
  reducers: {
    // Batch Cycles
    setBatchCycleFilters: (state, action) => {
      state.batchCycles.filters = { ...state.batchCycles.filters, ...action.payload }
    },
    
    setCurrentBatchCycle: (state, action) => {
      state.batchCycles.currentBatchCycle = action.payload
    },
    
    // Premises
    setPremiseFilters: (state, action) => {
      state.premises.filters = { ...state.premises.filters, ...action.payload }
    },
    
    togglePremiseActive: (state, action) => {
      const premiseId = action.payload
      premisesAdapter.updateOne(state.premises, {
        id: premiseId,
        changes: { active: !state.premises.entities[premiseId]?.active }
      })
    },
    
    // Infrastructure
    setInfrastructureFilters: (state, action) => {
      state.infrastructures.filters = { ...state.infrastructures.filters, ...action.payload }
    },
    
    setInfrastructureAvailability: (state, action) => {
      const { infrastructureId, availability } = action.payload
      state.infrastructures.availability[infrastructureId] = availability
    },
    
    // Capacity Management
    selectInfrastructureForCapacity: (state, action) => {
      state.capacityManagement.selectedInfrastructure = action.payload
    },
    
    updateBookingCalendar: (state, action) => {
      const { infrastructureId, date, bookings } = action.payload
      if (!state.capacityManagement.bookingCalendar[infrastructureId]) {
        state.capacityManagement.bookingCalendar[infrastructureId] = {}
      }
      state.capacityManagement.bookingCalendar[infrastructureId][date] = bookings
    },
    
    updateUtilizationStats: (state, action) => {
      const { infrastructureId, stats } = action.payload
      state.capacityManagement.utilizationStats[infrastructureId] = stats
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Batch Cycles
      .addMatcher(
        infrastructureApi.endpoints.getBatchCycles.matchFulfilled,
        (state, action) => {
          batchCyclesAdapter.setAll(state.batchCycles, action.payload)
          state.batchCycles.loading = false
          
          // Set current batch cycle if not already set
          if (!state.batchCycles.currentBatchCycle) {
            const currentCycle = action.payload.find(cycle => 
              cycle.status === 'active' || 
              (new Date() >= new Date(cycle.startDate) && new Date() <= new Date(cycle.endDate))
            )
            if (currentCycle) {
              state.batchCycles.currentBatchCycle = currentCycle.id
            }
          }
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.createBatchCycle.matchFulfilled,
        (state, action) => {
          batchCyclesAdapter.addOne(state.batchCycles, action.payload)
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.updateBatchCycle.matchFulfilled,
        (state, action) => {
          batchCyclesAdapter.updateOne(state.batchCycles, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      
      // Premises
      .addMatcher(
        infrastructureApi.endpoints.getPremises.matchFulfilled,
        (state, action) => {
          premisesAdapter.setAll(state.premises, action.payload)
          state.premises.loading = false
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.createPremise.matchFulfilled,
        (state, action) => {
          premisesAdapter.addOne(state.premises, action.payload)
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.updatePremise.matchFulfilled,
        (state, action) => {
          premisesAdapter.updateOne(state.premises, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      
      // Infrastructure
      .addMatcher(
        infrastructureApi.endpoints.getInfrastructures.matchFulfilled,
        (state, action) => {
          infrastructuresAdapter.setAll(state.infrastructures, action.payload)
          state.infrastructures.loading = false
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.createInfrastructure.matchFulfilled,
        (state, action) => {
          infrastructuresAdapter.addOne(state.infrastructures, action.payload)
        }
      )
      .addMatcher(
        infrastructureApi.endpoints.updateInfrastructure.matchFulfilled,
        (state, action) => {
          infrastructuresAdapter.updateOne(state.infrastructures, {
            id: action.payload.id,
            changes: action.payload
          })
        }
      )
      
      // Complex operations
      .addCase(createPremiseWithInfrastructure.fulfilled, (state, action) => {
        const { premise, infrastructures } = action.payload
        premisesAdapter.addOne(state.premises, premise)
        infrastructuresAdapter.addMany(state.infrastructures, infrastructures)
      })
      
      .addCase(checkInfrastructureAvailability.fulfilled, (state, action) => {
        const { infrastructureId, availability } = action.payload
        state.infrastructures.availability[infrastructureId] = availability
      })
  }
})

export const {
  setBatchCycleFilters,
  setCurrentBatchCycle,
  setPremiseFilters,
  togglePremiseActive,
  setInfrastructureFilters,
  setInfrastructureAvailability,
  selectInfrastructureForCapacity,
  updateBookingCalendar,
  updateUtilizationStats
} = infrastructureSlice.actions

export default infrastructureSlice.reducer

// store/adapters/infrastructureAdapter.js
export const infrastructureAdapters = {
  batchCycles: batchCyclesAdapter,
  premises: premisesAdapter,
  infrastructures: infrastructuresAdapter
}

// Entity selectors
export const infrastructureSelectors = {
  batchCycles: batchCyclesAdapter.getSelectors((state) => state.infrastructure.batchCycles),
  premises: premisesAdapter.getSelectors((state) => state.infrastructure.premises),
  infrastructures: infrastructuresAdapter.getSelectors((state) => state.infrastructure.infrastructures)
}