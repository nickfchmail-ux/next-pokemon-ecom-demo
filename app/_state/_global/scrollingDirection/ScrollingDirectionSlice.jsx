import { createSlice } from '@reduxjs/toolkit';

const initialState = { direction: 'down' };

const scrollingDirectionSlice = createSlice({
  name: 'scrolling',
  initialState,
  reducers: {
    setScrollingDirection: (state, action) => {
      state.direction = action.payload;
    },
  },
});

export const { setScrollingDirection } = scrollingDirectionSlice.actions;

export default scrollingDirectionSlice.reducer;
