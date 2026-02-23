import { Schema, Types, model } from "mongoose";
import { IPost } from "./interface.post";

const postSchema = new Schema<IPost>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    image: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    caption: {
      type: String,
      required: true,
      trim: true,
    },

    hashtags: {
      type: [String],
      default: [],
    },

    likes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },

    shares: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },

    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sharedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    template: {
      type: Types.ObjectId,
      ref: "Template",
    },

    isTemplateBased: {
      type: Boolean,
      default: false,
    },

    author: {
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: null,
      },
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Post = model<IPost>("Post", postSchema);
