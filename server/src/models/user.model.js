const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Auth identifiers
    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // Profile
    name: { type: String, trim: true, maxlength: 60 },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9_]{3,30}$/,
        "Username can only contain lowercase letters, numbers and underscores (3–30 chars)",
      ],
    },
    bio: { type: String, maxlength: 200, default: "" },
    avatar: { type: String, default: null }, // URL
    website: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },

    // Social
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Interests
    topics: [{ type: String }],

    // Status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }, // soft delete

    // Counts (denormalized for speed)
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    roomCount: { type: Number, default: 0 },

    // Saved rooms
    savedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],

    // Notification preferences
    notificationPrefs: {
      follows: { type: Boolean, default: true },
      roomInvite: { type: Boolean, default: true },
      friendRoom: { type: Boolean, default: true },
      handApproved: { type: Boolean, default: true },
      recordingReady: { type: Boolean, default: true },
    },

    // Privacy
    isPrivate: { type: Boolean, default: false },
    allowDirectInvites: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },

    // Audio preferences
    audioPrefs: {
      noiseSuppression: { type: Boolean, default: true },
      echoCancellation: { type: Boolean, default: true },
      autoGainControl: { type: Boolean, default: true },
    },

    // Roles & moderation
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ topics: 1 });
userSchema.index({ isOnline: 1 });

// Virtuals
userSchema.virtual("isFollowedByMe").get(function () {
  // Set via query context — see controller
  return this._isFollowedByMe || false;
});

// Instance method: public profile (strip sensitive data)
userSchema.methods.toPublicJSON = function (requesterId = null) {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  if (requesterId) {
    obj.isFollowedByMe = this.followers.some(
      (id) => id.toString() === requesterId.toString(),
    );
  }
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
