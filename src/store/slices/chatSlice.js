import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // Here this will add a new message to the chat
      if (action.payload.isStreaming) {
        const last = state.messages[state.messages.length - 1];
        if (last?.role === "assistant" && last.isStreaming) {
          last.content = action.payload.content;
          last.timestamp = action.payload.timestamp;
          return;
        }
      }
      state.messages.push(action.payload);
    },
    updateLastMessage: (state, action) => {
      // Here this will update the last message in the chat
      if (state.messages.length === 0) return;
      const last = state.messages[state.messages.length - 1];
      if (last?.role === "assistant") {
        last.content = action.payload.content;
        if (action.payload.isStreaming !== undefined) {
          last.isStreaming = action.payload.isStreaming !== false;
        }
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  setLoading,
  setError,
  clearError,
  clearChat,
  updateLastMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
