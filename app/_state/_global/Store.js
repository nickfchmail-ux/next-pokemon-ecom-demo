"use client"

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from "../_global/cart/CartSlice";
import scrollingDirection from '../_global/scrollingDirection/ScrollingDirectionSlice';
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    scrollingDirection: scrollingDirection,
  },
});
