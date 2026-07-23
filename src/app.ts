import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(helmet());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://bannexa.vercel.app",
  "https://bannexa.com",
  "https://www.bannexa.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o!))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get("/", (_, res) => {
  res.send({ message: "🚀 Bannexa server is running..." });
});


app.use(globalErrorHandler);
app.use(notFound);

export default app;