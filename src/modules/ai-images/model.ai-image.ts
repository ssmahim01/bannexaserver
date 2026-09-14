import mongoose, { Schema, Model } from "mongoose";
import { IAIImage } from "./interface.ai-image";
import {
  AI_CATEGORIES,
  AI_GENERATION_STATUS,
  AI_PROVIDERS,
} from "./constant.ai-image";

const aiImageSchema = new Schema<IAIImage>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
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
      default: "",
    },

    requestId: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    creditReserved: {
      type: Boolean,
      default: false,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
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
      maxlength: 1000,
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

aiImageSchema.index(
  {
    user: 1,
    requestId: 1,
  },
  {
    unique: true,
  },
);

const AIImage: Model<IAIImage> =
  mongoose.models.AIImage ||
  mongoose.model<IAIImage>("AIImage", aiImageSchema);

export default AIImage;