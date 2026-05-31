const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["host", "co_host", "speaker", "listener"],
      default: "listener",
    },
    isMuted: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    handRaised: { type: Boolean, default: false },
    handRaisedAt: { type: Date },
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 200, default: "" },

    // Room type
    type: {
      type: String,
      enum: ["public", "social", "private"],
      default: "public",
    },

    // Host
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Participants (active in room)
    participants: [participantSchema],

    // Topics / tags
    topics: [{ type: String }],

    // State
    isLive: { type: Boolean, default: true },
    isRecording: { type: Boolean, default: false },
    allowRecording: { type: Boolean, default: false },
    recordingUrl: { type: String, default: null },

    // Analytics snapshot (populated on room end)
    analytics: {
      duration: { type: Number, default: 0 }, // seconds
      peakListeners: { type: Number, default: 0 },
      totalJoined: { type: Number, default: 0 },
      messagesCount: { type: Number, default: 0 },
      handRaisesCount: { type: Number, default: 0 },
      speakersCount: { type: Number, default: 0 },
    },

    // Denormalized counts
    listenerCount: { type: Number, default: 0 },
    speakerCount: { type: Number, default: 1 },

    // Private room: invited user IDs
    invitedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Soft end
    endedAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
roomSchema.index({ isLive: 1, type: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ topics: 1 });
roomSchema.index({ createdAt: -1 });

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
