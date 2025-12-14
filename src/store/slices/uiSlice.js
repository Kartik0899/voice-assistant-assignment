import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connectionStatus: "disconnected",
  selectedVoice: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setSelectedVoice: (state, action) => {
      state.selectedVoice = action.payload;
    },
  },
});

export const { setConnectionStatus, setSelectedVoice } = uiSlice.actions;
export default uiSlice.reducer;
