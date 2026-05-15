import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyticsAPI } from "../services/api";

export const fetchDashboardStats = createAsyncThunk(
  "analytics/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getStats();
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch stats",
      );
    }
  },
);

export const fetchMonthlyPerformance = createAsyncThunk(
  "analytics/fetchMonthly",
  async (year, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getMonthlyPerformance(year);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch monthly performance",
      );
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    stats: null,
    monthlyPerformance: [],
    year: new Date().getFullYear(),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMonthlyPerformance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMonthlyPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyPerformance = action.payload.performance;
        state.year = action.payload.year;
      })
      .addCase(fetchMonthlyPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError: clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
