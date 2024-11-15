// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import productsSlice from "./features/productsSlice";

export const store = configureStore({
  reducer: {
    products: productsSlice,
  },
});

export default store;
