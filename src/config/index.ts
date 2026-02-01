import dotenv from "dotenv";
import path from "path";
import ms from "ms"

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL as string,

  bcryptSaltRounds: Number(process.env.SALT_ROUNDS) || 12,
  redis_url: process.env.REDIS_URL as string,

  jwt: {
    accessSecret: String(process.env.JWT_SECRET),
    refreshSecret: String(process.env.JWT_REFRESH_SECRET),
     accessExpiresIn: process.env.JWT_EXPIRES_IN as ms.StringValue,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN as ms.StringValue,
  },

  frontendUrl: process.env.FRONTEND_URL as string,
};

export default config;
