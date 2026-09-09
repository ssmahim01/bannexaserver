import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "./interface.user";
import { SUBSCRIPTION_PLANS } from "./constant.user";

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    password: {
      type: String,
      required: false,
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

    // Profile
    profileImage: String,
    phone: String,
    country: String,
    city: String,

    // Saved templates/posts
    savedPosts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: [],
    },

    // Subscription
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SUBSCRIPTION_PLANS),
        default: SUBSCRIPTION_PLANS.FREE,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      // Banner downloads
      downloadUsedThisMonth: {
        type: Number,
        default: 0,
        min: 0,
      },

      downloadResetAt: {
        type: Date,
        default: () =>
          new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },

      // AI generations
      aiGenerationUsedThisMonth: {
        type: Number,
        default: 0,
        min: 0,
      },

      aiGenerationResetAt: {
        type: Date,
        default: () =>
          new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },

      // Subscription period
      startedAt: {
        type: Date,
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },

    // Engagement
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    sharedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    providerId: String,

    // Auth
    tokenVersion: {
      type: Number,
      default: 0,
    },

    // Analytics
    stats: {
      totalPosts: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalBanners: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalDownloads: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
userSchema.index({ email: 1, status: 1 });
userSchema.index({ "subscription.plan": 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
