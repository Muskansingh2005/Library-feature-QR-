/**
 * Main Server Entry
 * -----------------
 * Starts Express server, connects MongoDB, enables JSON and CORS,
 * and mounts /api routes.
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect MongoDB
connectDB(process.env.MONGO_URI);

// Base route
app.get("/", (req, res) => {
  res.send("📚 Library Management Backend Running");
});

// Mount API routes
app.use("/api", routes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
