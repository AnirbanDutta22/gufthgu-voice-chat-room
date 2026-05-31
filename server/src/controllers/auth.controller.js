const User = require("../models/user.model");
const { sendOTP, verifyOTP } = require("../services/otp.service");
const { sendToken } = require("../utils/token");
const { asyncHandler } = require("../middlewares/errorHandler");

// @desc    Send OTP to phone or email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTPHandler = asyncHandler(async (req, res) => {
  const { contact, type } = req.body;

  if (!contact || !type) {
    return res
      .status(400)
      .json({ success: false, message: "contact and type are required" });
  }
  if (!["phone", "email"].includes(type)) {
    return res
      .status(400)
      .json({ success: false, message: 'type must be "phone" or "email"' });
  }

  const otp = await sendOTP(contact.trim(), type);

  const response = { success: true, message: `OTP sent to ${contact}` };
  // Expose OTP in dev mode for easy testing
  if (process.env.NODE_ENV === "development") response._devOtp = otp;

  res.status(200).json(response);
});

// @desc    Verify OTP and sign in / sign up
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { contact, otp, type } = req.body;

  if (!contact || !otp || !type) {
    return res
      .status(400)
      .json({ success: false, message: "contact, otp, and type are required" });
  }

  const result = await verifyOTP(contact.trim(), type, otp.trim());
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }

  // Find or create user
  const query = type === "phone" ? { phone: contact } : { email: contact };
  let user = await User.findOne(query);

  if (!user) {
    user = await User.create({
      [type]: contact,
      isVerified: true,
    });
  } else if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  sendToken(
    res,
    user,
    200,
    user.isProfileComplete ? "Welcome back!" : "Account created",
  );
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-__v");
  res.json({ success: true, user });
});

// @desc    Logout (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out" });
});

module.exports = { sendOTPHandler, verifyOTPHandler, getMe, logout };
