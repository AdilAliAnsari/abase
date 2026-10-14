import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn("⚠️ Warning: MongoDB Atlas connection failed.");
    console.warn("Reason:", error.message);
    console.warn("👉 To connect: whitelist your IP (0.0.0.0/0 for all) in MongoDB Atlas Network Access.");
    console.warn("Server will continue running so frontend can connect.");
  }
};

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  host: mongoose.connection.host || null
});