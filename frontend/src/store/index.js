import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '@/features/products/productsSlice';
import cartReducer, { CART_KEY } from '@/features/cart/cartSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import liveReducer from '@/features/live/liveSlice';
import adminReducer, { ADMIN_KEY_STORAGE } from '@/features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    live: liveReducer,
    admin: adminReducer,
  },
});

// Persist the cart across refreshes, and the admin key for the lifetime of the tab.
let lastItems = store.getState().cart.items;
let lastKey = store.getState().admin.key;
store.subscribe(() => {
  const state = store.getState();

  if (state.cart.items !== lastItems) {
    lastItems = state.cart.items;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lastItems));
    } catch {
      /* storage unavailable (private mode / quota) - cart just won't persist */
    }
  }

  if (state.admin.key !== lastKey) {
    lastKey = state.admin.key;
    try {
      if (lastKey) sessionStorage.setItem(ADMIN_KEY_STORAGE, lastKey);
      else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch {
      /* ignore */
    }
  }
});
