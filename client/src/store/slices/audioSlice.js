import { createSlice } from "@reduxjs/toolkit";

const audioSlice = createSlice({
  name: "audio",
  initialState: {
    isMuted: true,
    isSpeaker: false,
    isListening: true,
    stream: null,
    peerConnections: {},
    audioLevels: {},
    activeSpeaker: null,
    isRecordingAllowed: false,
    isRecording: false,
    recordingDuration: 0,
    deviceList: [],
    selectedMicId: null,
    selectedSpeakerId: null,
    hasPermission: null,
  },
  reducers: {
    setMuted: (state, action) => {
      state.isMuted = action.payload;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setIsSpeaker: (state, action) => {
      state.isSpeaker = action.payload;
    },
    setStream: (state, action) => {
      state.stream = action.payload;
    },
    setAudioLevel: (state, action) => {
      state.audioLevels[action.payload.userId] = action.payload.level;
    },
    setActiveSpeaker: (state, action) => {
      state.activeSpeaker = action.payload;
    },
    setRecordingAllowed: (state, action) => {
      state.isRecordingAllowed = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setRecordingDuration: (state, action) => {
      state.recordingDuration = action.payload;
    },
    setDeviceList: (state, action) => {
      state.deviceList = action.payload;
    },
    setSelectedMic: (state, action) => {
      state.selectedMicId = action.payload;
    },
    setSelectedSpeaker: (state, action) => {
      state.selectedSpeakerId = action.payload;
    },
    setHasPermission: (state, action) => {
      state.hasPermission = action.payload;
    },
    resetAudio: (state) => {
      state.isMuted = true;
      state.isSpeaker = false;
      state.stream = null;
      state.peerConnections = {};
      state.audioLevels = {};
      state.activeSpeaker = null;
      state.isRecording = false;
      state.recordingDuration = 0;
    },
  },
});

export const {
  setMuted,
  toggleMute,
  setIsSpeaker,
  setStream,
  setAudioLevel,
  setActiveSpeaker,
  setRecordingAllowed,
  setRecording,
  setRecordingDuration,
  setDeviceList,
  setSelectedMic,
  setSelectedSpeaker,
  setHasPermission,
  resetAudio,
} = audioSlice.actions;
export default audioSlice.reducer;
