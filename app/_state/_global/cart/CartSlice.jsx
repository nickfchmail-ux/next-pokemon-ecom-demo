'use client';

import { createSlice } from '@reduxjs/toolkit';

const initialState = { cart: [], broughtProducts: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.broughtProducts = false;
      const item = state.cart.find((i) => i.id === action.payload.id);

      if (item) {
        item.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id);
    },
    incrementQuantity: (state, action) => {
      console.log('trying to add sth');
      const item = state.cart.find((i) => i.id === action.payload.id);
      if (item) item.quantity = parseInt(item.quantity) + 1;
    },
    decrementQuantity: (state, action) => {
      console.log('trying to decrease sth');
      const item = state.cart.find((i) => i.id === action.payload.id);
      if (item) {
        if (item.quantity > 1) {
          item.quantity = parseInt(item.quantity) - 1;
        } else {
          state.cart = state.cart.filter((i) => i.id !== action.payload.id);
        }
      }
    },
    setQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const newQuantity = parseInt(quantity, 10);
      if (isNaN(newQuantity) || newQuantity < 0) return;
      const item = state.cart.find((i) => i.id === action.payload.id);

      item.quantity = quantity;
    },
    clearCart: (state) => {
      state.cart = [];
    },
    synchronizeRemoteCartData: (state, action) => {
      state.cart = action.payload;
    },
    saveLocalStorageDataToCartWhenNotLoggedIn: (state, action) => {
      state.cart = action.payload;
    },
    setBroughtProducts: (state, action) => {
      state.broughtProducts = action;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  setQuantity,
  synchronizeRemoteCartData,
  saveLocalStorageDataToCartWhenNotLoggedIn,
  setBroughtProducts,
} = cartSlice.actions;

export default cartSlice.reducer;
