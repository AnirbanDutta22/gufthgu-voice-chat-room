import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import roomReducer from "./slices/roomSlice";
import uiReducer from "./slices/uiSlice";
import userReducer from "./slices/userSlice";
import audioReducer from "./slices/audioSlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    ui: uiReducer,
    user: userReducer,
    audio: audioReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["audio/setStream", "audio/setPeerConnection"],
        ignoredPaths: ["audio.stream", "audio.peerConnections"],
      },
    }),
});

export default store;
