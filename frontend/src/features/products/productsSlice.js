import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

// One normalised store of products. The grid and the featured showcase only keep lists
// of ids, so a live stock update patches a single entity and both views re-render.
const adapter = createEntityAdapter();

const initialState = adapter.getInitialState({
  gridIds: [],
  featuredIds: [],
  categories: [],
  filters: { category: '', q: '', sort: 'featured' },
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  requestId: null, // latest grid request; older responses are ignored (race-condition guard)
  featuredStatus: 'idle',
});

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    return await api.get('/api/products', getState().products.filters);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const all = await api.get('/api/products');
    return all.filter((p) => p.featured);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/api/products/categories');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, { payload }) {
      Object.assign(state.filters, payload);
    },
    // An admin deleted a product: drop it everywhere (also handled by cart + admin slices).
    productRemoved(state, { payload: id }) {
      adapter.removeOne(state, id);
      state.gridIds = state.gridIds.filter((x) => x !== id);
      state.featuredIds = state.featuredIds.filter((x) => x !== id);
    },
    // Dispatched by the SSE stream whenever the server changes a product's stock.
    stockUpdated(state, { payload }) {
      const product = state.entities[payload.productId];
      if (product) product.stock = payload.stock;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        adapter.upsertMany(state, action.payload);
        state.gridIds = action.payload.map((p) => p.id);
        state.status = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchFeatured.pending, (state) => {
        state.featuredStatus = 'loading';
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        adapter.upsertMany(state, action.payload);
        state.featuredIds = action.payload.map((p) => p.id);
        state.featuredStatus = 'succeeded';
      })
      .addCase(fetchFeatured.rejected, (state) => {
        state.featuredStatus = 'failed';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setFilters, stockUpdated, productRemoved } = productsSlice.actions;
export default productsSlice.reducer;

// ---- selectors ----
const entitySelectors = adapter.getSelectors((state) => state.products);
export const selectProductCount = entitySelectors.selectTotal;

const selectEntities = (state) => state.products.entities;

export const selectGridProducts = createSelector(
  [(state) => state.products.gridIds, selectEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter(Boolean),
);

export const selectFeaturedProducts = createSelector(
  [(state) => state.products.featuredIds, selectEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter(Boolean),
);

export const selectTotalStock = createSelector([entitySelectors.selectAll], (all) =>
  all.reduce((sum, p) => sum + p.stock, 0),
);
