import { Schema, model } from "mongoose";
import { ICategory } from "./interface.category";

const categorySchema = new Schema<ICategory>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    nameEn: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Category = model<ICategory>("Category", categorySchema);