const express = require("express");
const {
  sendOTPHandler,
  verifyOTPHandler,
  getMe,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/send-otp").post(sendOTPHandler);
router.route("/verify-otp").post(verifyOTPHandler);
router.route("/me").get(protect, getMe);
router.route("/logout").post(protect, logout);

module.exports = router;
