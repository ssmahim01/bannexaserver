import { Schema, model } from "mongoose";
import { ITemplate } from "./interface.template";

const templateSchema = new Schema<ITemplate>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    previewImage: {
      type: String,
      required: true,
    },

    canvasWidth: {
      type: Number,
      required: true,
    },

    canvasHeight: {
      type: Number,
      required: true,
    },

    layers: {
      type: [
        {
          type: {
            type: String,
            enum: ["image", "text"],
            required: true,
          },
          x: Number,
          y: Number,
          width: Number,
          height: Number,
          fontSize: Number,
          color: String,
          placeholder: Boolean,
        },
      ],
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
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

export const Template = model<ITemplate>("Template", templateSchema);