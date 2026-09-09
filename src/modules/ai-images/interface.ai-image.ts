import { Types } from "mongoose";
import {
  AIImageCategory,
  AIGenerationStatus,
  AIProvider,
} from "./constant.ai-image";

export interface IAIImage {
  _id: Types.ObjectId;

  user: Types.ObjectId;

  // Generation configuration
  category: AIImageCategory;
  provider: AIProvider;

  // AI model used
  model?: string;

  // Generated image
  image: string;
  cloudinaryPublicId: string;

  // Generation status
  status: AIGenerationStatus;

  // Error information
  errorMessage?: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateAIImagePayload {
  userId: string;

  category: AIImageCategory;

  imageBuffer: Buffer;

  mimeType: string;
}

export interface GeneratedAIImage {
  buffer: Buffer;

  provider: AIProvider;

  model: string;
}