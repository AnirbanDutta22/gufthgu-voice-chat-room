import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/rooms", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchRoomById = createAsyncThunk(
  "room/fetchRoomById",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/rooms/${roomId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      const res = await api.post("/rooms", roomData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// New Thunk to handle updating room settings live
export const updateRoomSettings = createAsyncThunk(
  "room/updateRoomSettings",
  async ({ roomId, settings }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/rooms/${roomId}/settings`, settings);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const joinRoom = createAsyncThunk(
  "room/joinRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/rooms/${roomId}/join`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const leaveRoom = createAsyncThunk(
  "room/leaveRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/rooms/${roomId}/leave`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const endRoom = createAsyncThunk(
  "room/endRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/rooms/${roomId}/end`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const roomSlice = createSlice({
  name: "room",
  initialState: {
    rooms: [],
    currentRoom: null,
    activeParticipants: [],
    raisedHands: [],
    loading: false,
    creating: false,
    error: null,
    filters: { type: "all", topic: null, search: "" },
    pagination: { page: 1, total: 0, hasMore: true },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.activeParticipants = [];
      state.raisedHands = [];
    },
    updateParticipant: (state, action) => {
      const idx = state.activeParticipants.findIndex(
        (p) => p._id === action.payload._id,
      );
      if (idx !== -1)
        state.activeParticipants[idx] = {
          ...state.activeParticipants[idx],
          ...action.payload,
        };
    },
    addParticipant: (state, action) => {
      if (!state.activeParticipants.find((p) => p._id === action.payload._id))
        state.activeParticipants.push(action.payload);
    },
    removeParticipant: (state, action) => {
      state.activeParticipants = state.activeParticipants.filter(
        (p) => p._id !== action.payload,
      );
      state.raisedHands = state.raisedHands.filter(
        (id) => id !== action.payload,
      );
    },
    raiseHand: (state, action) => {
      if (!state.raisedHands.includes(action.payload))
        state.raisedHands.push(action.payload);
    },
    lowerHand: (state, action) => {
      state.raisedHands = state.raisedHands.filter(
        (id) => id !== action.payload,
      );
    },
    updateRoomListeners: (state, action) => {
      const room = state.rooms.find((r) => r._id === action.payload.roomId);
      if (room) room.listenerCount = action.payload.count;
      if (state.currentRoom?._id === action.payload.roomId)
        state.currentRoom.listenerCount = action.payload.count;
    },
    promoteToSpeaker: (state, action) => {
      const participant = state.activeParticipants.find(
        (p) => p._id === action.payload,
      );
      if (participant) {
        participant.role = "speaker";
        participant.isMuted = true;
      }
      state.raisedHands = state.raisedHands.filter(
        (id) => id !== action.payload,
      );
    },
    demoteToListener: (state, action) => {
      const participant = state.activeParticipants.find(
        (p) => p._id === action.payload,
      );
      if (participant) participant.role = "listener";
    },
    updateSpeakerMute: (state, action) => {
      const participant = state.activeParticipants.find(
        (p) => p._id === action.payload.userId,
      );
      if (participant) participant.isMuted = action.payload.isMuted;
    },
    toggleRecording: (state, action) => {
      if (state.currentRoom) state.currentRoom.isRecording = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.currentRoom = action.payload.room;
        state.activeParticipants = action.payload.participants;
      })
      .addCase(createRoom.pending, (state) => {
        state.creating = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.creating = false;
        state.rooms.unshift(action.payload.room);
        state.currentRoom = action.payload.room;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload.room;
        state.activeParticipants = action.payload.participants;
      })
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoom = null;
        state.activeParticipants = [];
        state.raisedHands = [];
      })
      .addCase(endRoom.fulfilled, (state) => {
        state.currentRoom = null;
        state.activeParticipants = [];
        state.raisedHands = [];
      });
  },
});

export const {
  setFilters,
  setCurrentRoom,
  clearCurrentRoom,
  updateParticipant,
  addParticipant,
  removeParticipant,
  raiseHand,
  lowerHand,
  updateRoomListeners,
  promoteToSpeaker,
  demoteToListener,
  updateSpeakerMute,
  toggleRecording,
} = roomSlice.actions;
export default roomSlice.reducer;
