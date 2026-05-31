const jwt = require("jsonwebtoken");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

// Attach token to cookie + return it
const sendToken = (res, user, statusCode = 200, message = "Success") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res.cookie("token", token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      topics: user.topics,
      isProfileComplete: user.isProfileComplete,
      isVerified: user.isVerified,
      role: user.role,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
    },
  });
};

module.exports = { generateToken, sendToken };
