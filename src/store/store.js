// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      app: appReducer,
    },
  });
};