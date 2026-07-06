const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  getRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  endRoom,
  updateRoomSettings,
  getRoomAnalytics,
  inviteUser,
} = require("../controllers/room.controller");

const router = express.Router();

router.use(protect); // all room routes require auth

router.route("/").get(getRooms).post(createRoom);
router.route("/:id").get(getRoomById);
router.route("/:id/settings").put(updateRoomSettings);
router.route("/:id/join").post(joinRoom);
router.route("/:id/leave").post(leaveRoom);
router.route("/:id/end").post(endRoom);
router.route("/:id/analytics").get(getRoomAnalytics);
router.route("/:id/invite").post(inviteUser);

module.exports = router;
