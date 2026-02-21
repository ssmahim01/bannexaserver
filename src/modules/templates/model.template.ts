import { Schema, Types, model } from "mongoose";
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

    author: {
      name: {
        type: String,
        required: false,
      },
      avatar: {
        type: String,
        default: null,
      },
    },

    previewImage: {
      type: String,
      required: true,
    },
    baseImagePublicId: {
      type: String,
      required: false,
    },
    cloudinaryPublicId: {
      type: String,
      required: false,
    },

    canvasWidth: {
      type: Number,
      required: true,
    },

    canvasHeight: {
      type: Number,
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // layers: {
    //   type: [
    //     {
    //       type: {
    //         type: String,
    //         enum: ["image", "text"],
    //         required: true,
    //       },
    //       x: Number,
    //       y: Number,
    //       width: Number,
    //       height: Number,
    //       fontSize: Number,
    //       color: String,
    //       placeholder: String,
    //     },
    //   ],
    //   required: true,
    // },
    downloads: {
      type: Number,
      default: 0,
      min: [0, "Downloads cannot be negative"],
      validate: {
        validator: function (value: number) {
          return !isNaN(value) && isFinite(value);
        },
        message: "Downloads must be a valid number",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Template = model<ITemplate>("Template", templateSchema);
