import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import logger from "./utils/logger";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.databaseUrl as string);

    server = app.listen(config.port, () => {
      logger.info(`🚀 Bannexa running on port ${config.port}`);
    });
  } catch (err) {
    logger.error(err);
  }
}

main();

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection", err);
  if (server) {
    server.close(() => process.exit(1));
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
  process.exit(1);
});