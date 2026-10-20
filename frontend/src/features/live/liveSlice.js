import { createSlice } from '@reduxjs/toolkit';

let counter = 0;

const liveSlice = createSlice({
  name: 'live',
  initialState: {
    connection: 'connecting', // connecting | live | offline
    feed: [], // most recent first, capped
    purchasesSeen: 0,
    catalogVersion: 0, // bumps whenever an admin changes the catalogue (admin screens re-fetch on it)
  },
  reducers: {
    setConnection(state, { payload }) {
      state.connection = payload;
    },
    purchaseReceived(state, { payload }) {
      state.feed.unshift({ ...payload, id: ++counter, at: Date.now() });
      state.feed = state.feed.slice(0, 8);
      state.purchasesSeen += 1;
    },
    catalogChanged(state) {
      state.catalogVersion += 1;
    },
  },
});

export const { setConnection, purchaseReceived, catalogChanged } = liveSlice.actions;
export default liveSlice.reducer;
