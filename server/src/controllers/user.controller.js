const User = require("../models/user.model");
const Room = require("../models/room.model");
const { asyncHandler } = require("../middlewares/errorHandler");
const { createNotification } = require("../services/notification.service");
const path = require("path");

// Helper to get io instance
const getIO = (req) => req.app.get("io");

// @desc    Update own profile (name, username, bio, avatar, topics)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "username",
    "bio",
    "website",
    "topics",
    "isProfileComplete",
    "notificationPrefs",
    "audioPrefs",
    "isPrivate",
    "allowDirectInvites",
    "showOnlineStatus",
  ];

  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Parse topics if sent as JSON string
  if (typeof updates.topics === "string") {
    try {
      updates.topics = JSON.parse(updates.topics);
    } catch {}
  }

  // Handle avatar upload
  if (req.file) {
    updates.avatar = `/uploads/${req.file.filename}`;
    // TODO: Replace with Cloudinary upload if configured
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-__v");

  res.json({ success: true, user });
});

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-__v");
  if (!user || !user.isActive) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const publicUser = user.toPublicJSON(req.user._id);

  // Also send following/followers count in header fields
  res.json({
    success: true,
    user: publicUser,
    following: user.following.length,
    followers: user.followers.length,
  });
});

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user._id.toString()) {
    return res
      .status(400)
      .json({ success: false, message: "You can't follow yourself" });
  }

  const target = await User.findById(targetId);
  if (!target || !target.isActive) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const alreadyFollowing = target.followers.includes(req.user._id);
  if (alreadyFollowing) {
    return res
      .status(400)
      .json({ success: false, message: "Already following" });
  }

  await User.findByIdAndUpdate(targetId, {
    $addToSet: { followers: req.user._id },
    $inc: { followerCount: 1 },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { following: targetId },
    $inc: { followingCount: 1 },
  });

  // Notify
  await createNotification(getIO(req), {
    recipientId: targetId,
    senderId: req.user._id,
    type: "follow",
    message: `${req.user.name || req.user.username} started following you`,
    data: { userId: req.user._id },
  });

  res.json({ success: true, message: "Followed" });
});

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  await User.findByIdAndUpdate(targetId, {
    $pull: { followers: req.user._id },
    $inc: { followerCount: -1 },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { following: targetId },
    $inc: { followingCount: -1 },
  });

  res.json({ success: true, message: "Unfollowed" });
});

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("followers", "name username avatar isOnline followerCount")
    .select("followers");
  res.json({ success: true, users: user?.followers || [] });
});

// @desc    Get following of a user
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("following", "name username avatar isOnline followerCount")
    .select("following");
  res.json({ success: true, users: user?.following || [] });
});

// @desc    Get rooms hosted by a user
// @route   GET /api/users/:id/rooms
// @access  Private
const getUserRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ host: req.params.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("host", "name username avatar")
    .select("title isLive type listenerCount topics createdAt");

  res.json({ success: true, rooms });
});

// @desc    Search users by name or username
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ success: true, users: [] });
  }

  const regex = new RegExp(q.trim(), "i");
  const users = await User.find({
    isActive: true,
    $or: [{ name: regex }, { username: regex }],
    _id: { $ne: req.user._id },
  })
    .select("name username avatar isOnline followerCount topics")
    .limit(15);

  res.json({ success: true, users });
});

// @desc    Get suggested users to follow
// @route   GET /api/users/suggested
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res) => {
  // Simple: users with overlapping topics not yet followed
  const me = await User.findById(req.user._id).select("following topics");
  const excluded = [...(me.following || []), req.user._id];

  const users = await User.find({
    _id: { $nin: excluded },
    isActive: true,
    isProfileComplete: true,
    ...(me.topics?.length ? { topics: { $in: me.topics } } : {}),
  })
    .sort({ followerCount: -1 })
    .limit(10)
    .select("name username avatar followerCount topics isOnline");

  res.json({ success: true, users });
});

// @desc    Update subscribed topics
// @route   PUT /api/users/topics
// @access  Private
const updateTopics = asyncHandler(async (req, res) => {
  const { topics } = req.body;
  if (!Array.isArray(topics)) {
    return res
      .status(400)
      .json({ success: false, message: "topics must be an array" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { topics },
    { new: true },
  ).select("topics");

  res.json({ success: true, topics: user.topics });
});

// @desc    Save / unsave a room
// @route   POST /api/users/saved/:roomId
// @access  Private
const toggleSavedRoom = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).select("savedRooms");
  const isSaved = me.savedRooms.includes(req.params.roomId);

  await User.findByIdAndUpdate(req.user._id, {
    [isSaved ? "$pull" : "$addToSet"]: { savedRooms: req.params.roomId },
  });

  res.json({ success: true, saved: !isSaved });
});

// @desc    Get saved rooms
// @route   GET /api/users/saved
// @access  Private
const getSavedRooms = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id)
    .populate({
      path: "savedRooms",
      select: "title isLive type listenerCount topics host createdAt",
      populate: { path: "host", select: "name username avatar" },
    })
    .select("savedRooms");

  res.json({ success: true, rooms: me.savedRooms || [] });
});

module.exports = {
  updateProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserRooms,
  searchUsers,
  getSuggestedUsers,
  updateTopics,
  toggleSavedRoom,
  getSavedRooms,
};
