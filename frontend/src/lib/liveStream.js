import { API_BASE } from '@/lib/api';
import { catalogChanged, purchaseReceived, setConnection } from '@/features/live/liveSlice';
import {
  fetchCategories,
  fetchFeatured,
  fetchProducts,
  productRemoved,
  stockUpdated,
} from '@/features/products/productsSlice';

/**
 * Opens a Server-Sent Events connection to /api/stream and feeds events into Redux.
 * Reconnects with exponential backoff and re-syncs the catalogue after an outage.
 * Returns a cleanup function.
 */
export function startLiveStream(dispatch) {
  let source;
  let timer;
  let stopped = false;
  let attempt = 0;
  let wasOffline = false;

  const resync = () => {
    dispatch(fetchProducts());
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
    dispatch(catalogChanged());
  };

  const connect = () => {
    dispatch(setConnection('connecting'));
    source = new EventSource(`${API_BASE}/api/stream`);

    source.addEventListener('hello', () => {
      attempt = 0;
      dispatch(setConnection('live'));
      if (wasOffline) {
        wasOffline = false;
        resync();
      }
    });

    source.addEventListener('stock', (e) => dispatch(stockUpdated(JSON.parse(e.data))));
    source.addEventListener('purchase', (e) => dispatch(purchaseReceived(JSON.parse(e.data))));

    // an admin added / edited / removed a product
    source.addEventListener('catalog', (e) => {
      const { action, productId } = JSON.parse(e.data);
      if (action === 'deleted') dispatch(productRemoved(productId));
      resync();
    });

    source.onerror = () => {
      source.close();
      wasOffline = true;
      dispatch(setConnection('offline'));
      if (!stopped) {
        timer = setTimeout(connect, Math.min(15000, 1000 * 2 ** attempt++));
      }
    };
  };

  connect();

  return () => {
    stopped = true;
    clearTimeout(timer);
    source?.close();
  };
}
