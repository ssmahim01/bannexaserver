import { IUser } from "../models/user.interface";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      PORT?: string;
      DATABASE_URL?: string;

      JWT_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      REFRESH_EXPIRES_IN?: string;
      REDIS_URL?: string;

      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
      CLOUDINARY_CLOUD_NAME?: string;

      FRONTEND_URL?: string;
    }
  }

  namespace Express {
    interface Request {
      user?: Partial<IUser> & {
        id: string;
        role?: string;
      };
    }
  }
}

export {};