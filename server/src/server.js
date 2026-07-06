const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db/config");
const app = require("./app");
const initSocket = require("./services/socket");

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// Initialize all socket event handlers
initSocket(io);

// Connect DB then start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`
        Gufthgu Server running
        Port : ${PORT}
        Mode : ${process.env.NODE_ENV}
    `);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });
});
