import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { toast } from 'sonner';
import { addItem, MAX_PER_ITEM, openCart } from '@/features/cart/cartSlice';

/** Shared "add to cart" behaviour (stock + per-order limits, toast feedback). */
export function useAddToCart() {
  const dispatch = useDispatch();
  const store = useStore();

  return useCallback(
    (product) => {
      if (product.stock < 1) {
        toast.error(`${product.name} just sold out`);
        return false;
      }
      const existing = store.getState().cart.items.find((i) => i.id === product.id);
      const limit = Math.min(MAX_PER_ITEM, product.stock);
      if (existing && existing.qty >= limit) {
        toast.error(existing.qty >= MAX_PER_ITEM ? `Maximum ${MAX_PER_ITEM} per order` : `Only ${product.stock} in stock`);
        return false;
      }
      dispatch(addItem(product));
      toast.success(`${product.name} added`, {
        action: { label: 'View cart', onClick: () => dispatch(openCart()) },
      });
      return true;
    },
    [dispatch, store],
  );
}
