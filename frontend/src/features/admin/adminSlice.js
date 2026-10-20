import { createAsyncThunk, createSelector, createSlice, isRejected } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { productRemoved, stockUpdated } from '@/features/products/productsSlice';

export const ADMIN_KEY_STORAGE = 'drift.admin.key';
export const LOW_STOCK = 5;

// The key lives in sessionStorage only: it is gone when the tab is closed.
function readKey() {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

const authHeaders = (getState) => ({ 'X-Admin-Key': getState().admin.key });
const failure = (err) => ({ message: err.message, status: err.status, errors: err.errors });

/** Turn a product from the API back into the request body shape. */
export const toRequest = (p) => ({
  name: p.name,
  description: p.description || '',
  price: p.price,
  category: p.category,
  imageUrl: p.imageUrl || '',
  stock: p.stock,
  rating: p.rating,
  featured: p.featured,
  badge: p.badge || '',
});

export const adminLogin = createAsyncThunk('admin/login', async (key, { rejectWithValue }) => {
  try {
    await api.get('/api/admin/verify', undefined, { 'X-Admin-Key': key });
    return key;
  } catch (err) {
    return rejectWithValue(failure(err));
  }
});

export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/api/products', { sort: 'newest' });
  } catch (err) {
    return rejectWithValue(failure(err));
  }
});

export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (_, { getState, rejectWithValue }) => {
  try {
    return await api.get('/api/admin/orders', undefined, authHeaders(getState));
  } catch (err) {
    return rejectWithValue(failure(err));
  }
});

/** Create (no id) or update (id) a product. */
export const saveProduct = createAsyncThunk('admin/saveProduct', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const headers = authHeaders(getState);
    return id
      ? await api.put(`/api/admin/products/${id}`, data, headers)
      : await api.post('/api/admin/products', data, headers);
  } catch (err) {
    return rejectWithValue(failure(err));
  }
});

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { getState, rejectWithValue }) => {
  try {
    await api.del(`/api/admin/products/${id}`, authHeaders(getState));
    return id;
  } catch (err) {
    return rejectWithValue(failure(err));
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: () => ({
    key: readKey(),
    authStatus: 'idle', // idle | loading | failed
    authError: null,
    products: [],
    productsStatus: 'idle',
    productsError: null,
    orders: [],
    ordersStatus: 'idle',
    ordersError: null,
  }),
  reducers: {
    logout(state) {
      state.key = '';
      state.authStatus = 'idle';
      state.authError = null;
      state.orders = [];
      state.ordersStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.authStatus = 'loading';
        state.authError = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.key = action.payload;
        state.authStatus = 'idle';
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.authError = action.payload?.message || action.error.message;
      })

      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsStatus = 'loading';
        state.productsError = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.productsStatus = 'succeeded';
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsStatus = 'failed';
        state.productsError = action.payload?.message || action.error.message;
      })

      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersStatus = 'loading';
        state.ordersError = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.ordersStatus = 'succeeded';
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersStatus = 'failed';
        state.ordersError = action.payload?.message || action.error.message;
      })

      // the list is updated from the server's response, so it is correct before the SSE refetch lands
      .addCase(saveProduct.fulfilled, (state, action) => {
        const saved = action.payload;
        const i = state.products.findIndex((p) => p.id === saved.id);
        if (i >= 0) state.products[i] = saved;
        else state.products.unshift(saved);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })

      // live events
      .addCase(stockUpdated, (state, { payload }) => {
        const p = state.products.find((x) => x.id === payload.productId);
        if (p) p.stock = payload.stock;
      })
      .addCase(productRemoved, (state, { payload: id }) => {
        state.products = state.products.filter((p) => p.id !== id);
      })

      // a rejected admin key anywhere signs the admin out
      .addMatcher(
        (action) => isRejected(action) && action.type.startsWith('admin/') && action.payload?.status === 401 && action.type !== adminLogin.rejected.type,
        (state) => {
          state.key = '';
          state.authError = 'Your admin session is no longer valid. Please sign in again.';
        },
      );
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;

// ---- selectors ----
export const selectAdminStats = createSelector(
  [(s) => s.admin.products, (s) => s.admin.orders],
  (products, orders) => ({
    products: products.length,
    units: products.reduce((n, p) => n + p.stock, 0),
    lowStock: products.filter((p) => p.stock <= LOW_STOCK).length,
    inventoryValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  }),
);
