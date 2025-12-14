import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import audioReducer from './slices/audioSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    audio: audioReducer,
    ui: uiReducer,
  },
});

