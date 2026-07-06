const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Room = require("../models/room.model");
const Message = require("../models/message.model");

// Map: userId -> socketId (for presence)
const onlineUsers = new Map();
// Map: roomId -> Set of userIds
const roomMembers = new Map();

const initSocket = (io) => {
  // Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "name username avatar isActive",
      );
      if (!user || !user.isActive) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Connection
  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Mark user online in DB
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    console.log(`[Socket] ${socket.user.username} connected (${socket.id})`);

    // Room: Join
    socket.on("room:join", async ({ roomId }) => {
      try {
        socket.join(`room:${roomId}`);

        if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Set());
        roomMembers.get(roomId).add(userId);

        // Broadcast to room that this user joined
        const user = socket.user;
        socket.to(`room:${roomId}`).emit("room:user_joined", {
          user: {
            _id: userId,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            role: "listener",
            isMuted: true,
          },
        });

        // Update listener count
        const room = await Room.findById(roomId);
        if (room) {
          io.to(`room:${roomId}`).emit("room:count_updated", {
            count: roomMembers.get(roomId)?.size || 0,
          });
        }

        console.log(`[Socket] ${user.username} joined room ${roomId}`);
      } catch (err) {
        console.error("[Socket] room:join error:", err.message);
      }
    });

    // Room: Leave
    socket.on("room:leave", async ({ roomId }) => {
      handleRoomLeave(socket, io, roomId, userId);
    });

    // Chat: Message
    socket.on("chat:message", async ({ roomId, message }) => {
      try {
        if (!message?.trim()) return;
        const text = message.trim().slice(0, 500);

        const saved = await Message.create({
          room: roomId,
          sender: userId,
          text,
        });

        // Increment room message analytics
        await Room.findByIdAndUpdate(roomId, {
          $inc: { "analytics.messagesCount": 1 },
        });

        const payload = {
          id: saved._id.toString(),
          userId,
          sender: {
            _id: userId,
            name: socket.user.name,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
          text,
          timestamp: saved.createdAt,
        };

        // Broadcast to all in room (including sender)
        io.to(`room:${roomId}`).emit("chat:message", payload);
      } catch (err) {
        console.error("[Socket] chat:message error:", err.message);
      }
    });

    // Room: Raise Hand
    socket.on("room:raise_hand", async ({ roomId }) => {
      try {
        await Room.updateOne(
          { _id: roomId, "participants.user": userId },
          {
            $set: {
              "participants.$.handRaised": true,
              "participants.$.handRaisedAt": new Date(),
            },
          },
        );
        await Room.findByIdAndUpdate(roomId, {
          $inc: { "analytics.handRaisesCount": 1 },
        });
        io.to(`room:${roomId}`).emit("room:raise_hand", { userId });
      } catch (err) {
        console.error("[Socket] raise_hand error:", err.message);
      }
    });

    // Room: Lower Hand
    socket.on("room:lower_hand", async ({ roomId }) => {
      try {
        await Room.updateOne(
          { _id: roomId, "participants.user": userId },
          { $set: { "participants.$.handRaised": false } },
        );
        io.to(`room:${roomId}`).emit("room:lower_hand", { userId });
      } catch (err) {
        console.error("[Socket] lower_hand error:", err.message);
      }
    });

    // Audio: Mute Toggle
    socket.on("audio:mute_toggle", async ({ roomId, isMuted }) => {
      try {
        await Room.updateOne(
          { _id: roomId, "participants.user": userId },
          { $set: { "participants.$.isMuted": isMuted } },
        );
        io.to(`room:${roomId}`).emit("audio:mute_toggle", { userId, isMuted });
      } catch (err) {
        console.error("[Socket] mute_toggle error:", err.message);
      }
    });

    // Room: Promote to Speaker
    socket.on("room:promote_speaker", async ({ roomId, userId: targetId }) => {
      try {
        // Only host/co_host can promote
        const room = await Room.findById(roomId);
        if (!room) return;
        const requester = room.participants.find(
          (p) => p.user?.toString() === userId,
        );
        if (!["host", "co_host"].includes(requester?.role)) return;

        await Room.updateOne(
          { _id: roomId, "participants.user": targetId },
          {
            $set: {
              "participants.$.role": "speaker",
              "participants.$.isMuted": false,
              "participants.$.handRaised": false,
            },
          },
        );

        io.to(`room:${roomId}`).emit("room:promoted", { userId: targetId });
        // Notify the promoted user directly
        io.to(`user:${targetId}`).emit("room:notification", {
          message: "You've been invited to speak! 🎤",
          type: "hand_approved",
        });
      } catch (err) {
        console.error("[Socket] promote_speaker error:", err.message);
      }
    });

    // Room: Demote to Listener
    socket.on("room:demote_speaker", async ({ roomId, userId: targetId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) return;
        const requester = room.participants.find(
          (p) => p.user?.toString() === userId,
        );
        if (!["host", "co_host"].includes(requester?.role)) return;

        await Room.updateOne(
          { _id: roomId, "participants.user": targetId },
          {
            $set: {
              "participants.$.role": "listener",
              "participants.$.isMuted": true,
            },
          },
        );

        io.to(`room:${roomId}`).emit("room:demoted", { userId: targetId });
      } catch (err) {
        console.error("[Socket] demote_speaker error:", err.message);
      }
    });

    // Room: Recording
    socket.on("room:start_recording", async ({ roomId }) => {
      try {
        await Room.findByIdAndUpdate(roomId, { isRecording: true });
        io.to(`room:${roomId}`).emit("room:recording_started");
      } catch (err) {
        console.error("[Socket] start_recording error:", err.message);
      }
    });

    socket.on("room:stop_recording", async ({ roomId }) => {
      try {
        await Room.findByIdAndUpdate(roomId, { isRecording: false });
        io.to(`room:${roomId}`).emit("room:recording_stopped");
      } catch (err) {
        console.error("[Socket] stop_recording error:", err.message);
      }
    });

    // Room: Reaction
    socket.on("room:reaction", ({ roomId, emoji }) => {
      io.to(`room:${roomId}`).emit("room:reaction", {
        userId,
        name: socket.user.name,
        emoji,
      });
    });

    // WebRTC Signaling
    socket.on("webrtc:offer", ({ to, offer }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc:offer", { from: userId, offer });
      }
    });

    socket.on("webrtc:answer", ({ to, answer }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc:answer", { from: userId, answer });
      }
    });

    socket.on("webrtc:ice_candidate", ({ to, candidate }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc:ice_candidate", {
          from: userId,
          candidate,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);

      // Leave all rooms this socket was in
      const rooms = [...socket.rooms].filter((r) => r.startsWith("room:"));
      for (const roomKey of rooms) {
        const roomId = roomKey.replace("room:", "");
        await handleRoomLeave(socket, io, roomId, userId);
      }

      // Mark offline (small delay to handle reconnects)
      setTimeout(async () => {
        if (!onlineUsers.has(userId)) {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      }, 5000);

      console.log(`[Socket] ${socket.user.username} disconnected`);
    });
  });
};

// Shared helper: cleanly remove user from room
async function handleRoomLeave(socket, io, roomId, userId) {
  try {
    socket.leave(`room:${roomId}`);

    if (roomMembers.has(roomId)) {
      roomMembers.get(roomId).delete(userId);
      if (roomMembers.get(roomId).size === 0) roomMembers.delete(roomId);
    }

    socket.to(`room:${roomId}`).emit("room:user_left", { userId });

    // Update participant list in DB
    await Room.updateOne(
      { _id: roomId },
      { $pull: { participants: { user: userId } } },
    );

    io.to(`room:${roomId}`).emit("room:count_updated", {
      count: roomMembers.get(roomId)?.size || 0,
    });
  } catch (err) {
    console.error("[Socket] handleRoomLeave error:", err.message);
  }
}

module.exports = initSocket;
