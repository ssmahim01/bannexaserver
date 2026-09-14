import {
  AIProvider,
} from "../constant.ai-image";

import {
  generateWithHuggingFace,
} from "./huggingface.provider";

import {
  generateWithGemini,
} from "./gemini.provider";

import {
  generateWithOpenRouter,
} from "./openrouter.provider";

interface GenerateImageProviderParams {
  provider: AIProvider;
  model: string;
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
}

export async function generateWithProvider({
  provider,
  model,
  imageBuffer,
  mimeType,
  prompt,
}: GenerateImageProviderParams) {
  switch (provider) {
    case "huggingface":
      return generateWithHuggingFace({
        imageBuffer,
        mimeType,
        prompt,
      });

    case "gemini":
      return generateWithGemini({
        imageBuffer,
        mimeType,
        prompt,
        model,
      });

    case "openrouter":
      return generateWithOpenRouter({
        imageBuffer,
        mimeType,
        prompt,
        model,
      });

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`,
      );
  }
}