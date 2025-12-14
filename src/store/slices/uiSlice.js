import { createSlice } from "@reduxjs/toolkit";

// Initialize state from localStorage if available
const getInitialState = () => {
  if (typeof window !== "undefined") {
    const savedOnboarding = localStorage.getItem("onboardingComplete");
    const savedUserName = localStorage.getItem("userName");
    return {
      connectionStatus: "disconnected",
      selectedVoice: null,
      userName: savedUserName || null,
      isOnboardingComplete: savedOnboarding === "true" || false,
    };
  }
  return {
    connectionStatus: "disconnected",
    selectedVoice: null,
    userName: null,
    isOnboardingComplete: false,
  };
};

const initialState = getInitialState();

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
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setOnboardingComplete: (state, action) => {
      state.isOnboardingComplete = action.payload;
    },
  },
});

export const { setConnectionStatus, setSelectedVoice, setUserName, setOnboardingComplete } = uiSlice.actions;
export default uiSlice.reducer;
