import { Types } from "mongoose";
import {
  AIImageCategory,
  AIProvider,
  AI_GENERATION_STATUS,
} from "./constant.ai-image";

export interface GenerateAIImagePayload {
  userId: string;
  category: AIImageCategory;
  imageBuffer: Buffer;
  mimeType: string;
  requestId: string;
}

export type AIGenerationType = "image" | "template";

export interface IAIImage {
  _id?: Types.ObjectId;

  user: Types.ObjectId;

  category?: AIImageCategory | null;

  generationType?: AIGenerationType;

  templateId?: Types.ObjectId;

  templateCategory?: string;

  templateEvent?: string;

  templateSelections?: Record<string, unknown>;

  provider: AIProvider;

  model?: string;

  image: string;

  cloudinaryPublicId: string;

  requestId: string;

  creditReserved: boolean;

  status: (typeof AI_GENERATION_STATUS)[keyof typeof AI_GENERATION_STATUS];

  errorMessage?: string | null;

  createdAt: Date;

  updatedAt: Date;
}

export interface GeneratedAIImage {
  buffer: Buffer;

  provider: AIProvider;

  model: string;
}
