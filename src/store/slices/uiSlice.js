import { createSlice } from "@reduxjs/toolkit";

// Initialize state from localStorage if available
const getInitialState = () => {
  if (typeof window !== "undefined") {
    const savedOnboarding = localStorage.getItem("onboardingComplete");
    const savedUserName = localStorage.getItem("userName");
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return {
      connectionStatus: "disconnected",
      selectedVoice: null,
      selectedLanguage: savedLanguage || "en-US",
      userName: savedUserName || null,
      isOnboardingComplete: savedOnboarding === "true" || false,
    };
  }
  return {
    connectionStatus: "disconnected",
    selectedVoice: null,
    selectedLanguage: "en-US",
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
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedLanguage", action.payload);
      }
    },
  },
});

export const { setConnectionStatus, setSelectedVoice, setUserName, setOnboardingComplete, setSelectedLanguage } = uiSlice.actions;
export default uiSlice.reducer;
