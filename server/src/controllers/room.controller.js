const Room = require("../models/room.model");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const { asyncHandler } = require("../middlewares/errorHandler");
const { createNotification } = require("../services/notification.service");

const getIO = (req) => req.app.get("io");

// Helpers
const populateParticipants = (room) => {
  // Flatten participants to a simple array with user data merged
  if (!room.participants) return [];
  return room.participants.map((p) => {
    const userData = p.user && typeof p.user === "object" ? p.user : {};
    return {
      _id: userData._id || p.user,
      name: userData.name,
      username: userData.username,
      avatar: userData.avatar,
      isOnline: userData.isOnline,
      role: p.role,
      isMuted: p.isMuted,
      handRaised: p.handRaised,
      joinedAt: p.joinedAt,
    };
  });
};

// ─── List / Browse
// @desc  Get live rooms (explore / following feed / saved)
// @route GET /api/v1/rooms
// @access Private
const getRooms = asyncHandler(async (req, res) => {
  const { type, topic, feed, saved, search, page = 1, limit = 20 } = req.query;

  const filter = { isLive: true };

  // Type filter
  if (type && type !== "all") filter.type = type;

  // Topic filter
  if (topic) filter.topics = topic;

  // Search by title
  if (search) filter.title = { $regex: search, $options: "i" };

  // Following feed
  if (feed === "following") {
    const me = await User.findById(req.user._id).select("following");
    filter.host = { $in: me.following || [] };
  }

  // Saved rooms
  if (saved === "true") {
    const me = await User.findById(req.user._id).select("savedRooms");
    filter._id = { $in: me.savedRooms || [] };
    delete filter.isLive; // saved rooms can be ended
  }

  // Private rooms: only show if user is invited or is host
  if (filter.type === "private") {
    filter.$or = [{ host: req.user._id }, { invitedUsers: req.user._id }];
  } else if (!filter.type) {
    // Mixed: exclude private rooms unless user is involved
    filter.$or = [
      { type: { $in: ["public", "social"] } },
      { type: "private", host: req.user._id },
      { type: "private", invitedUsers: req.user._id },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Room.countDocuments(filter);

  const rooms = await Room.find(filter)
    .sort({ listenerCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("host", "name username avatar isOnline")
    .populate("participants.user", "name username avatar isOnline")
    .select("-__v");

  res.json({
    success: true,
    rooms,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      hasMore: skip + rooms.length < total,
    },
  });
});

// @desc  Get single room with participants
// @route GET /api/v1/rooms/:id
// @access Private
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate("host", "name username avatar isOnline")
    .populate("participants.user", "name username avatar isOnline")
    .select("-__v");

  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });

  // Private room access check
  if (room.type === "private") {
    const isAllowed =
      room.host._id.toString() === req.user._id.toString() ||
      room.invitedUsers.some((id) => id.toString() === req.user._id.toString());
    if (!isAllowed)
      return res
        .status(403)
        .json({ success: false, message: "Private room — invite required" });
  }

  res.json({
    success: true,
    room,
    participants: populateParticipants(room),
  });
});

// Create

// @desc  Create a new room
// @route POST /api/v1/rooms
// @access Private
const createRoom = asyncHandler(async (req, res) => {
  const { title, description, type, topics, allowRecording } = req.body;

  if (!title?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Room title is required" });

  const room = await Room.create({
    title: title.trim(),
    description: description?.trim() || "",
    type: type || "public",
    topics: topics || [],
    allowRecording: allowRecording || false,
    host: req.user._id,
    participants: [{ user: req.user._id, role: "host", isMuted: false }],
    listenerCount: 0,
    speakerCount: 1,
    isLive: true,
    startedAt: new Date(),
  });

  // Increment host room count
  await User.findByIdAndUpdate(req.user._id, { $inc: { roomCount: 1 } });

  const populated = await Room.findById(room._id)
    .populate("host", "name username avatar")
    .populate("participants.user", "name username avatar isOnline");

  // Notify followers
  const me = await User.findById(req.user._id).select(
    "followers name username",
  );
  if (me.followers?.length) {
    me.followers.forEach((followerId) => {
      createNotification(getIO(req), {
        recipientId: followerId,
        senderId: req.user._id,
        type: "friend_room",
        message: `${me.name || me.username} started a room: "${title}"`,
        data: { roomId: room._id, roomTitle: title },
      });
    });
  }

  res.status(201).json({
    success: true,
    room: populated,
    participants: populateParticipants(populated),
  });
});

// Join / Leave / End

// @desc  Join a room
// @route POST /api/v1/rooms/:id/join
// @access Private
const joinRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate("host", "name username avatar isOnline")
    .populate("participants.user", "name username avatar isOnline");

  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });
  if (!room.isLive)
    return res.status(410).json({ success: false, message: "Room has ended" });

  // Private access check
  if (room.type === "private") {
    const allowed =
      room.host._id.toString() === req.user._id.toString() ||
      room.invitedUsers.some((id) => id.toString() === req.user._id.toString());
    if (!allowed)
      return res
        .status(403)
        .json({ success: false, message: "Private room — invite required" });
  }

  // Remove any stale participant entry, then add fresh
  const alreadyIn = room.participants.some(
    (p) =>
      p.user._id?.toString() === req.user._id.toString() ||
      p.user?.toString() === req.user._id.toString(),
  );

  if (!alreadyIn) {
    room.participants.push({
      user: req.user._id,
      role: "listener",
      isMuted: true,
    });
    room.listenerCount = room.participants.filter(
      (p) => p.role === "listener",
    ).length;
    room.analytics.totalJoined = (room.analytics.totalJoined || 0) + 1;
    room.analytics.peakListeners = Math.max(
      room.analytics.peakListeners || 0,
      room.listenerCount,
    );
    await room.save();
  }

  const updated = await Room.findById(room._id)
    .populate("host", "name username avatar isOnline")
    .populate("participants.user", "name username avatar isOnline");

  res.json({
    success: true,
    room: updated,
    participants: populateParticipants(updated),
  });
});

// @desc  Leave a room
// @route POST /api/v1/rooms/:id/leave
// @access Private
const leaveRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });

  room.participants = room.participants.filter(
    (p) => p.user?.toString() !== req.user._id.toString(),
  );
  room.listenerCount = room.participants.filter(
    (p) => p.role === "listener",
  ).length;
  room.speakerCount = room.participants.filter((p) =>
    ["host", "co_host", "speaker"].includes(p.role),
  ).length;
  await room.save();

  res.json({ success: true, message: "Left room" });
});

// @desc  End a room (host only)
// @route POST /api/v1/rooms/:id/end
// @access Private
const endRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });
  if (room.host.toString() !== req.user._id.toString())
    return res
      .status(403)
      .json({ success: false, message: "Only the host can end the room" });

  const durationSecs = Math.floor(
    (Date.now() - new Date(room.startedAt).getTime()) / 1000,
  );
  const msgCount = await Message.countDocuments({ room: room._id });

  room.isLive = false;
  room.endedAt = new Date();
  room.analytics.duration = durationSecs;
  room.analytics.messagesCount = msgCount;
  room.analytics.speakersCount = room.participants.filter((p) =>
    ["host", "co_host", "speaker"].includes(p.role),
  ).length;
  room.participants = [];
  room.listenerCount = 0;
  await room.save();

  // Emit room ended to all in-room sockets
  const io = getIO(req);
  if (io) {
    io.to(`room:${room._id}`).emit("room:ended", {
      roomId: room._id,
      analytics: room.analytics,
    });
  }

  res.json({ success: true, message: "Room ended", analytics: room.analytics });
});

// Update Settings

// @desc  Update room settings (host only)
// @route PUT /api/v1/rooms/:id/settings
// @access Private
const updateRoomSettings = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });
  if (room.host.toString() !== req.user._id.toString())
    return res
      .status(403)
      .json({ success: false, message: "Only the host can update settings" });

  const allowed = ["title", "type", "allowRecording", "description"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) room[field] = req.body[field];
  });
  await room.save();

  // Notify room members of settings change
  const io = getIO(req);
  if (io) {
    io.to(`room:${room._id}`).emit("room:settings_updated", {
      title: room.title,
      type: room.type,
      allowRecording: room.allowRecording,
    });
  }

  res.json({ success: true, room });
});

// Analytics

// @desc  Get room analytics
// @route GET /api/v1/rooms/:id/analytics
// @access Private
const getRoomAnalytics = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).select(
    "analytics title startedAt endedAt host",
  );
  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });

  const msgCount = await Message.countDocuments({ room: room._id });

  res.json({
    success: true,
    title: room.title,
    duration: room.analytics.duration || 0,
    peakListeners: room.analytics.peakListeners || 0,
    totalJoined: room.analytics.totalJoined || 0,
    messagesCount: msgCount || room.analytics.messagesCount || 0,
    handRaisesCount: room.analytics.handRaisesCount || 0,
    speakersCount: room.analytics.speakersCount || 0,
    recordingAvailable: !!room.analytics.recordingUrl,
    startedAt: room.startedAt,
    endedAt: room.endedAt,
  });
});

// Invite

// @desc  Invite user to private room
// @route POST /api/v1/rooms/:id/invite
// @access Private
const inviteUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const room = await Room.findById(req.params.id);
  if (!room)
    return res.status(404).json({ success: false, message: "Room not found" });
  if (room.host.toString() !== req.user._id.toString())
    return res
      .status(403)
      .json({ success: false, message: "Only host can invite" });

  await Room.findByIdAndUpdate(req.params.id, {
    $addToSet: { invitedUsers: userId },
  });

  const invitedUser = await User.findById(userId).select("name username");
  await createNotification(getIO(req), {
    recipientId: userId,
    senderId: req.user._id,
    type: "room_invite",
    message: `${req.user.name || req.user.username} invited you to "${room.title}"`,
    data: { roomId: room._id, roomTitle: room.title },
  });

  res.json({
    success: true,
    message: `Invited ${invitedUser?.name || userId}`,
  });
});

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  endRoom,
  updateRoomSettings,
  getRoomAnalytics,
  inviteUser,
};
