import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("[Socket] Connected:", socket.id));
  socket.on("disconnect", (reason) =>
    console.log("[Socket] Disconnected:", reason),
  );
  socket.on("connect_error", (err) =>
    console.error("[Socket] Error:", err.message),
  );

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ─── Room Events ─────────────────────────────────────────────────────────────
export const joinRoomSocket = (roomId) => socket?.emit("room:join", { roomId });

export const leaveRoomSocket = (roomId) =>
  socket?.emit("room:leave", { roomId });

export const sendChatMessage = (roomId, message) =>
  socket?.emit("chat:message", { roomId, message });

export const emitRaiseHand = (roomId) =>
  socket?.emit("room:raise_hand", { roomId });

export const emitLowerHand = (roomId) =>
  socket?.emit("room:lower_hand", { roomId });

export const emitMuteToggle = (roomId, isMuted) =>
  socket?.emit("audio:mute_toggle", { roomId, isMuted });

export const emitStartRecording = (roomId) =>
  socket?.emit("room:start_recording", { roomId });

export const emitStopRecording = (roomId) =>
  socket?.emit("room:stop_recording", { roomId });

export const emitReaction = (roomId, emoji) =>
  socket?.emit("room:reaction", { roomId, emoji });

export const emitSpeakerPromote = (roomId, userId) =>
  socket?.emit("room:promote_speaker", { roomId, userId });

export const emitSpeakerDemote = (roomId, userId) =>
  socket?.emit("room:demote_speaker", { roomId, userId });

export default { initSocket, getSocket, disconnectSocket };
