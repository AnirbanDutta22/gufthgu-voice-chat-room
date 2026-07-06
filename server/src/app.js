const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { errorHandler, notFound } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const roomRouter = require("./routes/room.route");
const { protect } = require("./middlewares/auth");

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Logging in dev
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (uploaded avatars)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rate limit
app.use("/api/v1", apiLimiter);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", protect, userRouter);
app.use("/api/v1/rooms", roomRouter);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Gufthgu API is running 🎤",
    env: process.env.NODE_ENV,
  });
});

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
