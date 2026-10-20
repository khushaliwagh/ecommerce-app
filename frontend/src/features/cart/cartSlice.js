import { createSelector, createSlice } from '@reduxjs/toolkit';
import { productRemoved, stockUpdated } from '@/features/products/productsSlice';
import { placeOrder } from '@/features/orders/ordersSlice';

export const CART_KEY = 'drift.cart.v1';
export const MAX_PER_ITEM = 10; // matches @Max(10) on the server

function loadItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((i) => i && typeof i.id === 'number' && i.qty > 0 && typeof i.price === 'number')
      : [];
  } catch {
    return [];
  }
}

const limitFor = (stock) => Math.max(1, Math.min(MAX_PER_ITEM, stock));

const cartSlice = createSlice({
  name: 'cart',
  initialState: () => ({ items: loadItems(), isOpen: false }),
  reducers: {
    addItem(state, { payload: p }) {
      const existing = state.items.find((i) => i.id === p.id);
      if (existing) {
        existing.stock = p.stock;
        existing.qty = Math.min(existing.qty + 1, limitFor(p.stock));
      } else if (p.stock > 0) {
        state.items.push({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock, qty: 1 });
      }
    },
    setQty(state, { payload: { id, qty } }) {
      const item = state.items.find((i) => i.id === id);
      if (item) item.qty = Math.min(Math.max(1, qty), limitFor(item.stock));
    },
    removeItem(state, { payload: id }) {
      state.items = state.items.filter((i) => i.id !== id);
    },
    clearCart(state) {
      state.items = [];
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // keep cart lines in sync with live stock
      .addCase(stockUpdated, (state, { payload }) => {
        const item = state.items.find((i) => i.id === payload.productId);
        if (item) item.stock = payload.stock;
      })
      // product deleted by an admin: it can no longer be ordered
      .addCase(productRemoved, (state, { payload: id }) => {
        state.items = state.items.filter((i) => i.id !== id);
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { addItem, setQty, removeItem, clearCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;

// ---- selectors ----
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = createSelector([selectCartItems], (items) => items.reduce((n, i) => n + i.qty, 0));
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0),
);
export const selectCartHasStockIssue = createSelector([selectCartItems], (items) =>
  items.some((i) => i.qty > i.stock),
);
