const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header or cookie
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-__v");
    if (!req.user || !req.user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or deactivated" });
    }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  next();
};

// Optional auth — attach user if token present, but don't block if missing
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-__v");
    } catch {}
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
