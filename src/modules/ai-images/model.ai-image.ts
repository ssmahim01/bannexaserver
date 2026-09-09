import mongoose, { Schema, Model } from "mongoose";
import { IAIImage } from "./interface.ai-image";
import {
  AI_CATEGORIES,
  AI_GENERATION_STATUS,
  AI_PROVIDERS,
} from "./constant.ai-image";

const aiImageSchema = new Schema<IAIImage>(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: Object.values(AI_CATEGORIES),
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: Object.values(AI_PROVIDERS),
      required: true,
      index: true,
    },

    model: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(AI_GENERATION_STATUS),
      default: AI_GENERATION_STATUS.PROCESSING,
      required: true,
      index: true,
    },

    errorMessage: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

aiImageSchema.index({
  user: 1,
  createdAt: -1,
});

aiImageSchema.index({
  user: 1,
  status: 1,
});

aiImageSchema.index({
  provider: 1,
  model: 1,
});

const AIImage: Model<IAIImage> =
  mongoose.models.AIImage ||
  mongoose.model<IAIImage>("AIImage", aiImageSchema);

export default AIImage;