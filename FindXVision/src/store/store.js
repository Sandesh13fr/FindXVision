import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import casesSlice from './slices/casesSlice';
import notificationsSlice from './slices/notificationsSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cases: casesSlice,
    notifications: notificationsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

