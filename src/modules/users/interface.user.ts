import { Types } from "mongoose";
import { SubscriptionPlan, UserRole, UserStatus } from "./constant.user";

export interface IUser {
  _id: Types.ObjectId;

  // Basic
  fullName: string;
  email: string;
  password: string;

  role: UserRole;
  status: UserStatus;
  provider?: string;
  providerId?: string;

  // Profile
  profileImage?: string;
  phone?: string;
  country?: string;
  city?: string;

  // Subscription
  subscription: {
    plan: SubscriptionPlan;
    isActive: boolean;
    downloadUsedThisMonth: number
    downloadResetAt: Date
    startedAt?: Date;
    expiresAt?: Date;
  };
   savedPosts: Types.ObjectId[];
   likedPosts: Types.ObjectId[];
   sharedPosts: Types.ObjectId[];

  // Auth
  isEmailVerified: boolean;
  tokenVersion: number;

  // Analytics
  stats: {
    totalPosts: number;
    totalBanners: number;
    totalDownloads: number;
  };

  createdAt: Date;
  updatedAt: Date;
}
