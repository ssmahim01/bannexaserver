import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "./interface.user";

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "creator", "manager"],
      default: "customer",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "block", "suspend"],
      default: "active",
      index: true,
    },

    profileImage: String,
    phone: String,
    country: String,
    city: String,

    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium", "enterprise"],
        default: "free",
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      startedAt: Date,
      expiresAt: Date,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials",
  },

  providerId: String,

    tokenVersion: {
      type: Number,
      default: 0,
    },

    stats: {
      totalPosts: { type: Number, default: 0 },
      totalBanners: { type: Number, default: 0 },
      totalDownloads: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1, status: 1 });
userSchema.index({ "subscription.plan": 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
