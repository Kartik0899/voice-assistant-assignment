import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  microphoneAccess: null,
  error: null,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setListening: (state, action) => {
      state.isListening = action.payload;
    },
    setSpeaking: (state, action) => {
      state.isSpeaking = action.payload;
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setMicrophoneAccess: (state, action) => {
      state.microphoneAccess = action.payload;
    },
    setAudioError: (state, action) => {
      state.error = action.payload;
    },
    clearAudioError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setListening,
  setSpeaking,
  setProcessing,
  setMicrophoneAccess,
  setAudioError,
  clearAudioError,
} = audioSlice.actions;
export default audioSlice.reducer;

