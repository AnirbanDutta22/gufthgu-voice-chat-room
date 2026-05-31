const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "follow",
        "room_invite",
        "friend_room",
        "hand_approved",
        "recording_ready",
        "system",
      ],
      required: true,
    },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { roomId, roomTitle }
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 },
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
