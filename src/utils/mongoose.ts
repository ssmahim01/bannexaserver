import mongoose from "mongoose";
import config from "../config";
import logger from "./logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUrl, {
      autoIndex: config.nodeEnv !== "production",
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("✅ MongoDB connected securely");
  } catch (error) {
    logger.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};