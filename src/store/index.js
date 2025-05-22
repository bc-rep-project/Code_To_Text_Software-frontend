import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import repositoryReducer from './slices/repositorySlice';
import conversionReducer from './slices/conversionSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    repository: repositoryReducer,
    conversion: conversionReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // To avoid issues with non-serializable data
    })
});

export default store; 