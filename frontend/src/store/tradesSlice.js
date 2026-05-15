import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tradesAPI } from "../services/api";

export const createTrade = createAsyncThunk(
  "trades/create",
  async (tradeData, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.create(tradeData);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create trade",
      );
    }
  },
);

export const fetchTrades = createAsyncThunk(
  "trades/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch trades",
      );
    }
  },
);

export const fetchTradeById = createAsyncThunk(
  "trades/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.getById(id);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch trade",
      );
    }
  },
);

export const updateTrade = createAsyncThunk(
  "trades/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.update(id, data);
      return response.data.trade;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update trade",
      );
    }
  },
);

export const deleteTrade = createAsyncThunk(
  "trades/delete",
  async (id, { rejectWithValue }) => {
    try {
      await tradesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete trade",
      );
    }
  },
);

export const createTradeReview = createAsyncThunk(
  "trades/createReview",
  async ({ tradeId, data }, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.createReview(tradeId, data);
      return { tradeId, review: response.data.review };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create review",
      );
    }
  },
);

export const updateTradeReview = createAsyncThunk(
  "trades/updateReview",
  async ({ tradeId, data }, { rejectWithValue }) => {
    try {
      const response = await tradesAPI.updateReview(tradeId, data);
      return { tradeId, review: response.data.review };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update review",
      );
    }
  },
);

const tradesSlice = createSlice({
  name: "trades",
  initialState: {
    trades: [],
    currentTrade: null,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTrade: (state) => {
      state.currentTrade = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create trade
      .addCase(createTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrade.fulfilled, (state, action) => {
        state.loading = false;
        state.trades.unshift(action.payload);
      })
      .addCase(createTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trades
      .addCase(fetchTrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.loading = false;
        state.trades = action.payload.trades;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trade by ID
      .addCase(fetchTradeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTradeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrade = action.payload;
      })
      .addCase(fetchTradeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update trade
      .addCase(updateTrade.fulfilled, (state, action) => {
        const index = state.trades.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.trades[index] = action.payload;
        }
        if (state.currentTrade?.id === action.payload.id) {
          state.currentTrade = action.payload;
        }
      })
      // Delete trade
      .addCase(deleteTrade.fulfilled, (state, action) => {
        state.trades = state.trades.filter((t) => t.id !== action.payload);
        state.total -= 1;
      })
      // Create review
      .addCase(createTradeReview.fulfilled, (state, action) => {
        const { tradeId, review } = action.payload;
        if (state.currentTrade?.id === tradeId) {
          state.currentTrade.review = review;
        }
        const index = state.trades.findIndex((t) => t.id === tradeId);
        if (index !== -1) {
          state.trades[index].review = review;
        }
      })
      // Update review
      .addCase(updateTradeReview.fulfilled, (state, action) => {
        const { tradeId, review } = action.payload;
        if (state.currentTrade?.id === tradeId) {
          state.currentTrade.review = review;
        }
        const index = state.trades.findIndex((t) => t.id === tradeId);
        if (index !== -1) {
          state.trades[index].review = review;
        }
      });
  },
});

export const { clearCurrentTrade, clearError: clearTradesError } =
  tradesSlice.actions;
export default tradesSlice.reducer;
