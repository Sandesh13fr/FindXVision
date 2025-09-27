import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { casesAPI } from '../../services/api';

const initialState = {
  cases: [],
  loading: false,
  error: null,
  selectedCase: null,
  filters: {
    status: '',
    priority: '',
    location: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async (params, { rejectWithValue }) => {
    try {
      const response = await casesAPI.getAllCases(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
    }
  }
);

export const createCase = createAsyncThunk(
  'cases/createCase',
  async (caseData, { rejectWithValue }) => {
    try {
      const response = await casesAPI.createCase(caseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create case');
    }
  }
);

export const updateCase = createAsyncThunk(
  'cases/updateCase',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await casesAPI.updateCase(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update case');
    }
  }
);

export const deleteCase = createAsyncThunk(
  'cases/deleteCase',
  async (id, { rejectWithValue }) => {
    try {
      await casesAPI.deleteCase(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete case');
    }
  }
);

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action) => {
      state.cases = action.payload;
    },
    setSelectedCase: (state, action) => {
      state.selectedCase = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cases
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create case
      .addCase(createCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.loading = false;
        state.cases.unshift(action.payload.data);
      })
      .addCase(createCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update case
      .addCase(updateCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cases.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.cases[index] = action.payload.data;
        }
      })
      .addCase(updateCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete case
      .addCase(deleteCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = state.cases.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setCases, 
  setSelectedCase, 
  setLoading, 
  setError, 
  setFilters, 
  setPagination, 
  clearError 
} = casesSlice.actions;

export default casesSlice.reducer;