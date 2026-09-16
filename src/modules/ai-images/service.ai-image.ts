import mongoose from "mongoose";

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
  AI_UNLIMITED_PLANS,
} from "./constant.ai-image";

import {
  GenerateAIImagePayload,
  GeneratedAIImage,
  IAIImage,
} from "./interface.ai-image";

import { uploadToCloudinaryBuffer } from "../../utils/cloudinary";

import { SubscriptionPlan } from "../users/constant.user";

import { generateWithOpenRouter } from "./providers/openrouter.provider";
import { generateWithHuggingFace } from "./providers/huggingface.provider";

import { IUser } from "../users/interface.user";

import { AI_PROMPTS } from "./prompt.ai-image";
import { generateWithGemini } from "./providers/gemini.provider";

function getNextMonthResetDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function shouldFallbackToGemini(error: unknown): boolean {
  if (!(error instanceof Error)) return true;

  const message = error.message.toLowerCase();

  return (
    message.includes("quota") ||
    message.includes("credit") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("service unavailable") ||
    message.includes("temporarily unavailable") ||
    message.includes("503") ||
    message.includes("429") ||
    message.includes("timeout")
  );
}

async function resetMonthlyAIUsageIfNeeded(userId: string) {
  const now = new Date();
  const nextResetAt = getNextMonthResetDate(now);

  await User.updateOne(
    {
      _id: userId,

      $or: [
        {
          "subscription.aiGenerationResetAt": {
            $exists: false,
          },
        },
        {
          "subscription.aiGenerationResetAt": {
            $lte: now,
          },
        },
      ],
    },
    {
      $set: {
        "subscription.aiGenerationUsedThisMonth": 0,
        "subscription.aiGenerationResetAt": nextResetAt,
      },
    },
  );
}

function getAIPlanConfiguration(user: IUser) {
  const plan = user.subscription.plan;

  const provider = AI_PLAN_PROVIDERS[plan];

  const model = AI_PLAN_MODELS[plan];

  const limit = AI_GENERATION_LIMITS[plan];

  if (!provider) {
    throw new Error("AI provider is not configured for this plan");
  }

  if (!model) {
    throw new Error("AI model is not configured for this plan");
  }

  if (limit === undefined) {
    throw new Error("AI generation limit is not configured for this plan");
  }

  return {
    plan,
    provider,
    model,
    limit,
    unlimited: AI_UNLIMITED_PLANS.includes(plan),
  };
}

function getAIPrompt(category: AIImageCategory): string {
  const categoryPrompt = AI_PROMPTS[category];

  if (!categoryPrompt) {
    throw new Error("Invalid AI generation category");
  }

  const globalPrompt = `
GLOBAL IMAGE GENERATION INSTRUCTIONS:

Use the uploaded image as the primary visual reference.

IDENTITY PRESERVATION:
- Preserve the person's recognizable identity and major facial characteristics.
- Maintain the original facial structure, facial proportions, skin tone, age, and natural appearance where applicable.
- Do not replace the person with an unrelated person or create a different identity.
- Preserve the original pose and composition unless the category specifically requests a change.
- Do not unnecessarily alter facial features.

IMAGE QUALITY:
- Generate a high-quality, visually polished image.
- Use professional composition and balanced framing.
- Apply realistic lighting and natural details.
- Maintain appropriate anatomy, proportions, and facial details.
- Produce a premium result suitable for a professional creative design platform.
- Avoid excessive smoothing, unnatural skin, distorted facial features, and artificial-looking details.

CONTENT AND CLEAN OUTPUT:
- Do not add text, captions, typography, watermarks, signatures, or random logos.
- Do not add unnecessary objects or distracting visual elements.
- Follow the selected category's creative direction accurately.
- Preserve a coherent and visually consistent result.
`;

  return `
${categoryPrompt.trim()}

${globalPrompt.trim()}
`.trim();
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
      try {
        return await generateWithHuggingFace({
          imageBuffer,
          mimeType,
          prompt,
        });
      } catch (error) {
        if (!shouldFallbackToGemini(error)) {
          throw error;
        }

        console.warn("Hugging Face unavailable. Trying Gemini fallback...");

        return await generateWithGemini({
          imageBuffer,
          mimeType,
          prompt,
          model: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
        });
      }

    case AI_PROVIDERS.GEMINI:
      return await generateWithGemini({
        imageBuffer,
        mimeType,
        prompt,
        model,
      });

    case AI_PROVIDERS.OPENROUTER:
      return await generateWithOpenRouter({
        imageBuffer,
        mimeType,
        prompt,
        model,
      });

    default:
      throw new Error("Unsupported AI provider");
  }
}

function buildGenerationResponse(
  aiImage: IAIImage,
  plan: SubscriptionPlan,
  used: number,
  limit: number,
  unlimited: boolean,
) {
  return {
    id: aiImage._id,

    image: aiImage.image,

    category: aiImage.category,

    provider: aiImage.provider,

    model: aiImage.model,

    status: aiImage.status,

    createdAt: aiImage.createdAt,

    plan,

    usage: {
      used,

      limit: unlimited ? null : limit,

      remaining: unlimited ? null : Math.max(limit - used, 0),

      unlimited,
    },
  };
}

export async function getAIUsage(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  await resetMonthlyAIUsageIfNeeded(userId);

  const user = await User.findById(userId).select("subscription").lean();

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

  const unlimited = AI_UNLIMITED_PLANS.includes(plan);

  const used = user.subscription.aiGenerationUsedThisMonth ?? 0;

  return {
    plan,

    used,

    limit: unlimited ? null : limit,

    remaining: unlimited ? null : Math.max(limit - used, 0),

    unlimited,

    resetAt: user.subscription.aiGenerationResetAt,
  };
}

export async function getMyAIGenerations(userId: string, page = 1, limit = 12) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const safePage = Math.min(100000, Math.max(1, Math.floor(Number(page) || 1)));

  const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 12)));

  const skip = (safePage - 1) * safeLimit;

  const filter = {
    user: userId,
    status: AI_GENERATION_STATUS.COMPLETED,
  };

  const [items, total] = await Promise.all([
    AIImage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select("_id category provider model image status createdAt updatedAt")
      .lean(),

    AIImage.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    items,

    pagination: {
      page: safePage,

      limit: safeLimit,

      total,

      totalPages,

      hasNextPage: safePage < totalPages,

      hasPreviousPage: safePage > 1,
    },
  };
}

export async function getMyAIImage(userId: string, imageId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!imageId) {
    throw new Error("AI image ID is required");
  }

  if (!mongoose.isValidObjectId(imageId)) {
    throw new Error("AI image not found");
  }

  const aiImage = await AIImage.findOne({
    _id: imageId,

    user: userId,

    status: AI_GENERATION_STATUS.COMPLETED,
  }).lean();

  if (!aiImage) {
    throw new Error("AI image not found");
  }

  return aiImage;
}

export async function deleteMyAIImage(userId: string, imageId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!imageId) {
    throw new Error("AI image ID is required");
  }

  if (!mongoose.isValidObjectId(imageId)) {
    throw new Error("AI image not found");
  }

  const aiImage = await AIImage.findOne({
    _id: imageId,
    user: userId,
  });

  if (!aiImage) {
    throw new Error("AI image not found");
  }

  if (aiImage.cloudinaryPublicId) {
    try {
      const cloudinary = await import("../../config/cloudinary");

      await cloudinary.default.uploader.destroy(aiImage.cloudinaryPublicId);
    } catch (error) {
      console.error("AI image Cloudinary delete error:", error);

      throw new Error("AI image could not be deleted");
    }
  }
  await AIImage.deleteOne({
    _id: aiImage._id,
    user: userId,
  });

  return {
    success: true,
  };
}

export async function generateAIImage(payload: GenerateAIImagePayload) {
  const { userId, category, imageBuffer, mimeType, requestId } = payload;

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!category) {
    throw new Error("AI category is required");
  }

  if (!requestId) {
    throw new Error("AI generation request ID is required");
  }

  if (requestId.length > 100) {
    throw new Error("Invalid AI generation request ID");
  }

  if (!imageBuffer?.length) {
    throw new Error("Image is required");
  }

  if (!mimeType?.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  if (imageBuffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image size cannot exceed 5 MB");
  }
  let user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "block" || user.status === "suspend") {
    throw new Error("Your account is not allowed to use AI");
  }

  if (!user.subscription) {
    throw new Error("Subscription information not found");
  }
  await resetMonthlyAIUsageIfNeeded(userId);
  user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "block" || user.status === "suspend") {
    throw new Error("Your account is not allowed to use AI");
  }

  if (!user.subscription) {
    throw new Error("Subscription information not found");
  }

  const { plan, provider, model, limit, unlimited } =
    getAIPlanConfiguration(user);

  const prompt = getAIPrompt(category as AIImageCategory);

  let aiImage: mongoose.HydratedDocument<IAIImage> | null = null;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existing = await AIImage.findOne({
        user: userId,
        requestId,
      }).session(session);

      if (existing) {
        if (existing.status === AI_GENERATION_STATUS.COMPLETED) {
          throw new Error("AI_GENERATION_ALREADY_COMPLETED");
        }

        if (existing.status === AI_GENERATION_STATUS.PROCESSING) {
          throw new Error("AI_GENERATION_IN_PROGRESS");
        }
        throw new Error("AI_GENERATION_REQUEST_ALREADY_USED");
      }

      let reservedUser;

      if (unlimited) {
        reservedUser = await User.findOneAndUpdate(
          {
            _id: userId,
          },
          {
            $inc: {
              "subscription.aiGenerationUsedThisMonth": 1,
            },
          },
          {
            new: true,
            session,
          },
        );
      } else {
        reservedUser = await User.findOneAndUpdate(
          {
            _id: userId,

            "subscription.plan": plan,

            "subscription.aiGenerationUsedThisMonth": {
              $lt: limit,
            },
          },
          {
            $inc: {
              "subscription.aiGenerationUsedThisMonth": 1,
            },
          },
          {
            new: true,
            session,
          },
        );
      }

      if (!reservedUser) {
        throw new Error(
          `You have reached your monthly AI generation limit of ${limit}.`,
        );
      }
      const newAIImage = new AIImage({
        user: userId,

        category,

        provider,

        model,

        image: "",

        cloudinaryPublicId: "",

        requestId,

        creditReserved: !unlimited,

        status: AI_GENERATION_STATUS.PROCESSING,

        errorMessage: null,
      });

      // Ensure Mongoose generates the document ID
      if (!newAIImage._id) {
        throw new Error("AI image document ID could not be generated");
      }

      await newAIImage.save({
        session,
      });

      aiImage = newAIImage;
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "AI_GENERATION_ALREADY_COMPLETED"
    ) {
      const existing = await AIImage.findOne({
        user: userId,
        requestId,
        status: AI_GENERATION_STATUS.COMPLETED,
      }).lean();

      if (!existing) {
        throw new Error("AI image could not be found");
      }

      const freshUser = await User.findById(userId)
        .select("subscription")
        .lean();

      if (!freshUser) {
        throw new Error("User not found");
      }

      const used = freshUser.subscription?.aiGenerationUsedThisMonth ?? 0;

      return buildGenerationResponse(existing, plan, used, limit, unlimited);
    }

    throw error;
  } finally {
    await session.endSession();
  }

  if (!aiImage) {
    throw new Error("AI generation could not be initialized");
  }

  const initializedAIImage = aiImage as mongoose.HydratedDocument<IAIImage>;

  let cloudinaryResult: any | null = null;

  try {
    const generated = await generateImageByProvider(
      provider,
      model,
      imageBuffer,
      mimeType,
      prompt,
    );

    if (!generated?.buffer?.length) {
      throw new Error("AI provider returned an empty image");
    }
    if (generated.buffer.length > 15 * 1024 * 1024) {
      throw new Error("Generated image is too large");
    }

    cloudinaryResult = await uploadToCloudinaryBuffer(
      generated.buffer,
      "bannexa-ai",
    );

    if (!cloudinaryResult?.secure_url || !cloudinaryResult?.public_id) {
      throw new Error("Generated image could not be saved");
    }

    const completed = await AIImage.findOneAndUpdate(
      {
        _id: initializedAIImage._id,

        user: userId,

        status: AI_GENERATION_STATUS.PROCESSING,
      },
      {
        $set: {
          image: cloudinaryResult.secure_url,

          cloudinaryPublicId: cloudinaryResult.public_id,

          provider: generated.provider,

          model: generated.model,

          status: AI_GENERATION_STATUS.COMPLETED,

          errorMessage: null,

          creditReserved: false,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!completed) {
      throw new Error("Generated image could not be saved");
    }

    const freshUser = await User.findById(userId).select("subscription").lean();

    if (!freshUser) {
      throw new Error("User not found");
    }

    const currentUsage = freshUser.subscription?.aiGenerationUsedThisMonth ?? 0;

    return buildGenerationResponse(
      completed,
      plan,
      currentUsage,
      limit,
      unlimited,
    );
  } catch (error: unknown) {
    console.error("AI generation failed:", error);

    if (cloudinaryResult?.public_id) {
      try {
        const cloudinary = await import("../../config/cloudinary");

        await cloudinary.default.uploader.destroy(cloudinaryResult.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    try {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const failed = await AIImage.findOneAndUpdate(
            {
              _id: aiImage!._id,

              user: userId,

              status: AI_GENERATION_STATUS.PROCESSING,

              creditReserved: !unlimited,
            },
            {
              $set: {
                status: AI_GENERATION_STATUS.FAILED,

                errorMessage: "AI image generation failed",

                creditReserved: false,
              },
            },
            {
              new: true,
              session,
            },
          );

          if (failed && !unlimited) {
            await User.updateOne(
              {
                _id: userId,

                "subscription.aiGenerationUsedThisMonth": {
                  $gt: 0,
                },
              },
              {
                $inc: {
                  "subscription.aiGenerationUsedThisMonth": -1,
                },
              },
              {
                session,
              },
            );
          }
        });
      } finally {
        await session.endSession();
      }
    } catch (refundError) {
      console.error("AI credit release transaction failed:", refundError);
    }
    throw new Error("AI image generation failed");
  }
}
