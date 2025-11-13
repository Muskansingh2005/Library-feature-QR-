/**
 * MongoDB Connection Module
 * -------------------------
 * Exports an async function that connects to MongoDB using Mongoose.
 */
import mongoose from "mongoose";

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit if connection fails
  }
};

export default connectDB;
