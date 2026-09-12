import User from "../users/model.user";
import AIImage from "./model.ai-image";

import {
  AI_GENERATION_LIMITS,
  AI_GENERATION_STATUS,
  AI_PROVIDERS,
  AIImageCategory,
  AIProvider,
  AI_PLAN_MODELS,
  AI_PLAN_PROVIDERS,
} from "./constant.ai-image";

import { GenerateAIImagePayload, GeneratedAIImage } from "./interface.ai-image";

import { uploadToCloudinaryBuffer } from "../../utils/cloudinary";

import { SubscriptionPlan } from "../users/constant.user";

import { generateWithOpenRouter } from "./providers/openrouter.provider";

import { IUser } from "../users/interface.user";

import { AI_PROMPTS } from "./prompt.ai-image";
import { generateWithHuggingFace } from "./providers/huggingface.provider";

async function resetMonthlyAIUsageIfNeeded(user: any): Promise<void> {
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

    await user.save();
  }
}

export async function getAIUsage(userId: string) {
  const user = await User.findById(userId).select("subscription");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.subscription) {
    throw new Error("Subscription information not found");
  }

  const plan = user.subscription.plan as SubscriptionPlan;

  const limit = AI_GENERATION_LIMITS[plan];

  if (limit === undefined) {
    throw new Error("AI generation limit is not configured for this plan");
  }

  const now = new Date();

  if (
    !user.subscription.aiGenerationResetAt ||
    now >= user.subscription.aiGenerationResetAt
  ) {
    user.subscription.aiGenerationUsedThisMonth = 0;

    user.subscription.aiGenerationResetAt = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );

    await user.save();
  }

  const used = user.subscription.aiGenerationUsedThisMonth ?? 0;

  return {
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: user.subscription.aiGenerationResetAt,
  };
}

function getAIPlanConfiguration(user: IUser) {
  const plan = user.subscription.plan;

  const provider = AI_PLAN_PROVIDERS[plan];
  const model = AI_PLAN_MODELS[plan];
  const limit = AI_GENERATION_LIMITS[plan];

  if (!provider) {
    throw new Error(
      "AI provider is not configured for this plan",
    );
  }

  if (!model) {
    throw new Error(
      "AI model is not configured for this plan",
    );
  }

  if (limit === undefined) {
    throw new Error(
      "AI generation limit is not configured for this plan",
    );
  }

  return {
    plan,
    provider,
    model,
    limit,
  };
}

function getAIPrompt(category: AIImageCategory): string {
  const prompt = AI_PROMPTS[category];

  if (!prompt) {
    throw new Error("Invalid AI generation category");
  }

  return `
${prompt}

Create a high-quality, visually polished image.
Professional composition.
Realistic details.
Premium lighting.
High visual quality.
Suitable for a professional design platform.

IMPORTANT:
Use the uploaded image as the primary reference.
Preserve the identity and recognizable characteristics
of the person in the uploaded image.
Do not replace the person with a different person.
`;
}

async function generateImageByProvider(
  provider: AIProvider,
  model: string,
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
): Promise<GeneratedAIImage> {
  switch (provider) {
    case AI_PROVIDERS.HUGGINGFACE:
      return generateWithHuggingFace({
        imageBuffer,
        mimeType,
        prompt,
      });

    case AI_PROVIDERS.OPENROUTER:
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

  await resetMonthlyAIUsageIfNeeded(user);

  const { plan, provider, model, limit } = getAIPlanConfiguration(user);

  const used = user.subscription.aiGenerationUsedThisMonth ?? 0;

  if (used >= limit) {
    throw new Error(
      `You have reached your monthly AI generation limit of ${limit}.`,
    );
  }

  const prompt = getAIPrompt(category as AIImageCategory);

  let generated: GeneratedAIImage;

  try {
    generated = await generateImageByProvider(
      provider,
      model,
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
