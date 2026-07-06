const express = require("express");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  updateProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserRooms,
  getSavedRooms,
  toggleSavedRoom,
  searchUsers,
  getSuggestedUsers,
  updateTopics,
} = require("../controllers/user.controller");

const router = express.Router();

// IMPORTANT: specific routes must come BEFORE /:id param routes
router.route("/profile").put(upload.single("avatar"), updateProfile);
router.route("/search").get(searchUsers);
router.route("/suggested").get(getSuggestedUsers);
router.route("/topics").put(updateTopics);
router.route("/saved").get(getSavedRooms);
router.route("/saved/:roomId").post(toggleSavedRoom);

// Param routes last
router.route("/:id").get(getUserProfile);
router.route("/:id/follow").post(followUser);
router.route("/:id/unfollow").post(unfollowUser);
router.route("/:id/followers").get(getFollowers);
router.route("/:id/following").get(getFollowing);
router.route("/:id/rooms").get(getUserRooms);

module.exports = router;
