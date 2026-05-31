const express = require("express");
const path = require("path");
const cors = require("cors");

//internal imports
const { errorHandler } = require("./middlewares/errorHandler");
// const testRouter = require("./routes/test.route");
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const { protect } = require("./middlewares/auth");

const app = express();

//cors
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

//request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", protect, userRouter);
// app.use("/api/v1", testRouter);

//errors handler
app.use(errorHandler);

module.exports = app;
