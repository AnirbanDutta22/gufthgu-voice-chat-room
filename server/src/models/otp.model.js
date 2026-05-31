const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  contact: { type: String, required: true }, // phone or email
  type: { type: String, enum: ["phone", "email"], required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
});

// TTL index — MongoDB auto-deletes after expiry + 5 min buffer
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });
otpSchema.index({ contact: 1, type: 1 });

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
