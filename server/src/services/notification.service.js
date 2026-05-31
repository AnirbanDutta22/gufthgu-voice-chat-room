const Notification = require("../models/notification.model");

/**
 * Create a notification and emit it via socket if user is online.
 * @param {object} io - Socket.io server instance
 * @param {object} options
 */
const createNotification = async (
  io,
  { recipientId, senderId, type, message, data = {} },
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      data,
    });

    // Push to recipient's socket room if they're connected
    if (io) {
      io.to(`user:${recipientId}`).emit("notification:new", {
        id: notification._id,
        type,
        message,
        data,
        timestamp: notification.createdAt,
        read: false,
      });
    }

    return notification;
  } catch (err) {
    console.error("[Notification] Failed to create:", err.message);
  }
};

module.exports = { createNotification };
