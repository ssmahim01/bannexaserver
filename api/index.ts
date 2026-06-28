import mongoose from "mongoose";
import serverless from "serverless-http";
import app from "../src/app";
import config from "../src/config";

let connected = false;

async function connectDB() {
  if (connected) return;

  await mongoose.connect(config.databaseUrl as string);

  connected = true;
}

const handler = serverless(app);

export default async (req: any, res: any) => {
  await connectDB();

  return handler(req, res);
};