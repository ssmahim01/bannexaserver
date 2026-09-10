import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

import User from "../users/model.user";
import AIImage from "./model.ai-image";

import {
  AI_GENERATION_LIMITS,
  AI_GENERATION_STATUS,
  AI_PLAN_PROVIDERS,
  AI_PROVIDERS,
  AI_PROMPTS,
  AIImageCategory,
  AIProvider,
} from "./constant.ai-image";

import { GenerateAIImagePayload, GeneratedAIImage } from "./interface.ai-image";

import { uploadToCloudinaryBuffer } from "../../utils/cloudinary";

import { SubscriptionPlan } from "../users/constant.user";

const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

function resetMonthlyAIUsageIfNeeded(user: any): void {
  const now = new Date();

  const resetAt = user.subscription?.aiGenerationResetAt
    ? new Date(user.subscription.aiGenerationResetAt)
    : null;

  if (!resetAt || now >= resetAt) {
    user.subscription.aiGenerationUsedThisMonth = 0;

    user.subscription.aiGenerationResetAt = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );
  }
}

function getAIPlanConfiguration(user: any): {
  plan: SubscriptionPlan;
  provider: AIProvider;
  limit: number;
} {
  const subscription = user.subscription;

  if (!subscription) {
    throw new Error(
      "Subscription information not found",
    );
  }

  const plan: SubscriptionPlan =
    subscription.plan;

  if (!plan) {
    throw new Error(
      "Subscription plan not found",
    );
  }

  if (!subscription.isActive) {
    throw new Error(
      "Your subscription is inactive",
    );
  }

  const provider =
    AI_PLAN_PROVIDERS[plan];

  const limit =
    AI_GENERATION_LIMITS[plan];

  if (!provider) {
    throw new Error(
      "AI provider is not configured for this plan",
    );
  }

  if (typeof limit !== "number") {
    throw new Error(
      "AI generation limit is not configured for this plan",
    );
  }

  return {
    plan,
    provider,
    limit,
  };
}

function getAIPrompt(category: AIImageCategory): string {
  const prompt = AI_PROMPTS[category];

  if (!prompt) {
    throw new Error("Invalid AI generation category");
  }

  return prompt;
}

async function generateWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedAIImage> {
  if (!gemini) {
    throw new Error("Gemini API is not configured");
  }

  const base64Image = imageBuffer.toString("base64");

  const response = await gemini.models.generateContent({
    model: GEMINI_IMAGE_MODEL,

    contents: [
      {
        role: "user",

        parts: [
          {
            text: prompt,
          },

          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],

    config: {
      responseModalities: ["IMAGE"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  const imagePart = parts.find((part) => !!part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini did not return a generated image");
  }

  return {
    buffer: Buffer.from(imagePart.inlineData.data, "base64"),

    provider: AI_PROVIDERS.GEMINI,

    model: GEMINI_IMAGE_MODEL,
  };
}

async function generateWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedAIImage> {
  if (!openai) {
    throw new Error("OpenAI API is not configured");
  }

  const extension = getExtensionFromMimeType(mimeType);
  const arrayBuffer = imageBuffer.buffer.slice(
    imageBuffer.byteOffset,
    imageBuffer.byteOffset + imageBuffer.byteLength,
  ) as ArrayBuffer;

  const imageFile = new File([arrayBuffer], `bannexa-input.${extension}`, {
    type: mimeType,
  });

  const response = await openai.images.edit({
    model: OPENAI_IMAGE_MODEL,

    image: imageFile,

    prompt,

    size: "1024x1024",
  });

  const base64Image = response.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error("OpenAI did not return a generated image");
  }

  return {
    buffer: Buffer.from(base64Image, "base64"),

    provider: AI_PROVIDERS.OPENAI,

    model: OPENAI_IMAGE_MODEL,
  };
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    default:
      return "png";
  }
}

async function generateImageByProvider(
  provider: AIProvider,
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedAIImage> {
  switch (provider) {
    case AI_PROVIDERS.GEMINI:
      return generateWithGemini(imageBuffer, mimeType, prompt);

    case AI_PROVIDERS.OPENAI:
      return generateWithOpenAI(imageBuffer, mimeType, prompt);

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export async function generateAIImage(payload: GenerateAIImagePayload) {
  const { userId, category, imageBuffer, mimeType } = payload;
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!category) {
    throw new Error("AI category is required");
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("Image is required");
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "block" || user.status === "suspend") {
    throw new Error("Your account is not allowed to use AI");
  }

  resetMonthlyAIUsageIfNeeded(user);

  const { plan, provider, limit } = getAIPlanConfiguration(user);

  const used = user.subscription.aiGenerationUsedThisMonth ?? 0;

  if (used >= limit) {
    throw new Error(
      `You have reached your monthly AI generation limit of ${limit}.`,
    );
  }

  const prompt = getAIPrompt(category);

  let generated: GeneratedAIImage;

  try {
    generated = await generateImageByProvider(
      provider,
      imageBuffer,
      mimeType,
      prompt,
    );
  } catch (error: unknown) {
    console.error("AI provider generation error:", error);

    const message =
      error instanceof Error ? error.message : "AI image generation failed";

    throw new Error(message);
  }

  let cloudinaryResult: any;

  try {
    cloudinaryResult = await uploadToCloudinaryBuffer(
      generated.buffer,
      "bannexa-ai",
    );
  } catch (error: unknown) {
    console.error("AI Cloudinary upload error:", error);

    throw new Error("Generated image could not be saved");
  }
  let aiImage;

  try {
    aiImage = await AIImage.create({
      user: user._id,

      category,

      provider: generated.provider,

      model: generated.model,

      image: cloudinaryResult.secure_url,

      cloudinaryPublicId: cloudinaryResult.public_id,

      status: AI_GENERATION_STATUS.COMPLETED,

      errorMessage: null,
    });
  } catch (error: unknown) {
    console.error("AI image database error:", error);
    try {
      if (cloudinaryResult?.public_id) {
        const cloudinary = await import("../../config/cloudinary");

        await cloudinary.default.uploader.destroy(cloudinaryResult.public_id);
      }
    } catch (cleanupError) {
      console.error("Cloudinary cleanup failed:", cleanupError);
    }

    throw new Error("Generated image could not be saved");
  }

  user.subscription.aiGenerationUsedThisMonth = used + 1;

  await user.save();

  const currentUsage = user.subscription.aiGenerationUsedThisMonth;

  return {
    id: aiImage._id,

    image: aiImage.image,

    category: aiImage.category,

    provider: aiImage.provider,

    model: aiImage.model,

    status: aiImage.status,

    plan,

    usage: {
      used: currentUsage,

      limit,

      remaining: Math.max(limit - currentUsage, 0),
    },
  };
}
