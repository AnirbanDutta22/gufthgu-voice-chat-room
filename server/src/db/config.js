const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const FINAL_URI = `${process.env.MONGO_CONNECTION_URI}/${process.env.DB_NAME}`;
    console.log(FINAL_URI);
    const conn = await mongoose.connect(FINAL_URI, {
      // No extra options needed with Mongoose 7+
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful disconnect
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});

module.exports = connectDB;
