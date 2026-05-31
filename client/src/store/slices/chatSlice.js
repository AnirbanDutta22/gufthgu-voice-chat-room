import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    unreadCount: 0,
    isChatOpen: false,
    reactions: {},
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
      if (!state.isChatOpen) state.unreadCount += 1;
      if (state.messages.length > 200)
        state.messages = state.messages.slice(-200);
    },
    addReaction: (state, action) => {
      const { messageId, emoji, userId } = action.payload;
      if (!state.reactions[messageId]) state.reactions[messageId] = {};
      if (!state.reactions[messageId][emoji])
        state.reactions[messageId][emoji] = [];
      if (!state.reactions[messageId][emoji].includes(userId))
        state.reactions[messageId][emoji].push(userId);
    },
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
      if (action.payload) state.unreadCount = 0;
    },
    clearChat: (state) => {
      state.messages = [];
      state.unreadCount = 0;
      state.reactions = {};
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, addReaction, setChatOpen, clearChat, setMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
