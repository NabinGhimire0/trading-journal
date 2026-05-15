import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import tradesReducer from './tradesSlice'
import analyticsReducer from './analyticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trades: tradesReducer,
    analytics: analyticsReducer,
  },
})