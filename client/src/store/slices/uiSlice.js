import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    createRoomModalOpen: false,
    inviteModalOpen: false,
    roomEndedModalOpen: false,
    analyticsModalOpen: false,
    searchOpen: false,
    activeModal: null,
    notifications: [],
    toasts: [],
  },
  reducers: {
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCreateRoomModal: (state, action) => {
      state.createRoomModalOpen = action.payload;
    },
    setInviteModal: (state, action) => {
      state.inviteModalOpen = action.payload;
    },
    setRoomEndedModal: (state, action) => {
      state.roomEndedModalOpen = action.payload;
    },
    setAnalyticsModal: (state, action) => {
      state.analyticsModalOpen = action.payload;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        ...action.payload,
        read: false,
      });
      if (state.notifications.length > 50)
        state.notifications = state.notifications.slice(0, 50);
    },
    markNotificationRead: (state, action) => {
      const n = state.notifications.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setCreateRoomModal,
  setInviteModal,
  setRoomEndedModal,
  setAnalyticsModal,
  setSearchOpen,
  setActiveModal,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;
