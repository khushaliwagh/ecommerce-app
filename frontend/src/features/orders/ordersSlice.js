import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export const placeOrder = createAsyncThunk('orders/place', async (payload, { rejectWithValue }) => {
  try {
    return await api.post('/api/orders', payload);
  } catch (err) {
    // `errors` carries per-field messages produced by @Valid on the server
    return rejectWithValue({ message: err.message, status: err.status, errors: err.errors });
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    fieldErrors: {},
    lastOrder: null,
  },
  reducers: {
    resetOrder(state) {
      state.status = 'idle';
      state.error = null;
      state.fieldErrors = {};
      state.lastOrder = null;
    },
    clearOrderError(state) {
      state.error = null;
      state.fieldErrors = {};
      if (state.status === 'failed') state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.error.message;
        state.fieldErrors = action.payload?.errors || {};
      });
  },
});

export const { resetOrder, clearOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;
