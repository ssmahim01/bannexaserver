import mongoose from "mongoose";

import User from "../users/model.user";
import AIImage from "../ai-images/model.ai-image";

import {
  AI_GENERATION_LIMITS,
  AI_GENERATION_STATUS,
  AI_UNLIMITED_PLANS,
  AI_PROVIDERS,
} from "../ai-images/constant.ai-image";

import { IAIImage } from "../ai-images/interface.ai-image";

import { uploadToCloudinaryBuffer } from "../../utils/cloudinary";

import { SubscriptionPlan } from "../users/constant.user";

import { generateWithClipdrop } from "../ai-images/providers/clipdrop.provider";

import { GenerateTemplateImagePayload } from "./interface.template-generator";

import { buildTemplatePrompt } from "./service.prompt-builder";

const CLIPDROP_MODEL = "clipdrop-text-to-image";

const MAX_GENERATED_IMAGE_SIZE = 15 * 1024 * 1024;

function getNextMonthResetDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function buildTemplateHistoryItem(
  image: IAIImage & {
    _id: mongoose.Types.ObjectId;
  },
) {
  const selections = image.templateSelections ?? {};

  const template = String(
    selections.template ?? "",
  );

  const values = Object.fromEntries(
    Object.entries(selections)
      .filter(([key]) => key !== "template")
      .map(([key, value]) => [
        key,
        String(value ?? ""),
      ]),
  );

  return {
    id: image._id.toString(),

    image: image.image,

    generationType: "template" as const,

    provider: image.provider,

    model: image.model ?? "",

    status: image.status,

    references: {
      category: image.templateCategory ?? "",
      event: image.templateEvent ?? "",
      template,
    },

    values,

    createdAt: image.createdAt,

    updatedAt: image.updatedAt,
  };
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

async function getPlanUsage(userId: string) {
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
    limit,
    unlimited,
    used,
  };
}

function validateGenerationValues(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (!key.trim()) {
      throw new Error("Invalid template field");
    }

    if (typeof value !== "string") {
      throw new Error(`Invalid value for "${key}"`);
    }

    if (value.length > 500) {
      throw new Error(`"${key}" cannot exceed 500 characters`);
    }
  }
}

function buildTemplateGenerationResponse(
  image: IAIImage | any,
  plan: SubscriptionPlan,
  used: number,
  limit: number,
  unlimited: boolean,
) {
  return {
    id: image._id,

    image: image.image,

    category: image.templateCategory,

    item: image.templateEvent,

    template: image.templateSelections?.template ?? null,

    values: image.templateSelections ?? {},

    generationType: "template" as const,

    provider: image.provider,

    model: image.model,

    status: image.status,

    createdAt: image.createdAt,

    plan,

    usage: {
      used,
      limit: unlimited ? null : limit,
      remaining: unlimited ? null : Math.max(limit - used, 0),
      unlimited,
    },
  };
}

export async function generateTemplateImage(
  payload: GenerateTemplateImagePayload,
) {
  const { userId, category, event, template, values, requestId } = payload;

  if (!userId?.trim()) {
    throw new Error("User ID is required");
  }

  if (!category?.trim()) {
    throw new Error("Category is required");
  }

  if (!event?.trim()) {
    throw new Error("Event is required");
  }

  if (!template?.trim()) {
    throw new Error("Template is required");
  }

  if (!requestId?.trim()) {
    throw new Error("Template generation request ID is required");
  }

  if (requestId.length > 100) {
    throw new Error("Invalid template generation request ID");
  }

  validateGenerationValues(values);

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

  if (!user.subscription) {
    throw new Error("Subscription information not found");
  }

  const plan = user.subscription.plan as SubscriptionPlan;

  const limit = AI_GENERATION_LIMITS[plan];

  if (limit === undefined) {
    throw new Error("AI generation limit is not configured for this plan");
  }

  const unlimited = AI_UNLIMITED_PLANS.includes(plan);
  const cleanCategory = category.trim();
  const cleanEvent = event.trim();
  const cleanTemplate = template.trim();

  const prompt = buildTemplatePrompt({
    category: cleanCategory,
    event: cleanEvent,
    template: cleanTemplate,
    values,
  });

  let aiImage: mongoose.HydratedDocument<IAIImage> | null = null;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Idempotency check
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

      const reservedUser = unlimited
        ? await User.findOneAndUpdate(
            {
              _id: userId,
              "subscription.plan": plan,
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
          )
        : await User.findOneAndUpdate(
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

      if (!reservedUser) {
        if (unlimited) {
          throw new Error("AI generation credit could not be reserved");
        }

        throw new Error(
          `You have reached your monthly AI generation limit of ${limit}.`,
        );
      }

      const newAIImage = new AIImage({
        user: userId,
        category: null,

        generationType: "template",

        templateCategory: cleanCategory,

        templateEvent: cleanEvent,

        templateSelections: {
          template: cleanTemplate,
          ...values,
        },

        provider: AI_PROVIDERS.CLIPDROP,

        model: CLIPDROP_MODEL,

        image: "",

        cloudinaryPublicId: "",

        requestId,

        creditReserved: !unlimited,

        status: AI_GENERATION_STATUS.PROCESSING,

        errorMessage: null,
      });

      await newAIImage.save({
        session,
      });

      aiImage = newAIImage;
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "AI_GENERATION_ALREADY_COMPLETED"
    ) {
      const existing = await AIImage.findOne({
        user: userId,
        requestId,
      }).lean();

      if (existing) {
        const freshUsage = await getPlanUsage(userId);

        return buildTemplateGenerationResponse(
          existing,
          freshUsage.plan,
          freshUsage.used,
          freshUsage.limit,
          freshUsage.unlimited,
        );
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }

  const aiImageData = aiImage as any;

  if (!aiImageData?._id) {
    throw new Error("Template generation could not be initialized");
  }

  const aiImageId = aiImageData._id;

  let cloudinaryResult: {
    secure_url?: string;
    public_id?: string;
  } | null = null;

  try {
    const generated = await generateWithClipdrop({
      prompt,
    });

    if (!generated?.buffer?.length) {
      throw new Error("Clipdrop did not return a generated image");
    }

    if (generated.buffer.length > MAX_GENERATED_IMAGE_SIZE) {
      throw new Error("Generated image is too large");
    }

    cloudinaryResult = await uploadToCloudinaryBuffer(
      generated.buffer,
      "bannexa-template-generator",
    );

    if (!cloudinaryResult?.secure_url || !cloudinaryResult?.public_id) {
      throw new Error("Generated image could not be saved");
    }

    const completed = await AIImage.findOneAndUpdate(
      {
        _id: aiImageId,
        user: userId,
        status: AI_GENERATION_STATUS.PROCESSING,
      },
      {
        $set: {
          image: cloudinaryResult.secure_url,

          cloudinaryPublicId: cloudinaryResult.public_id,

          provider: AI_PROVIDERS.CLIPDROP,

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

    const used = freshUser.subscription?.aiGenerationUsedThisMonth ?? 0;

    return buildTemplateGenerationResponse(
      completed,
      plan,
      used,
      limit,
      unlimited,
    );
  } catch (error) {
    console.error("Template image generation failed:", error);

    if (cloudinaryResult?.public_id) {
      try {
        const cloudinary = await import("../../config/cloudinary");

        await cloudinary.default.uploader.destroy(cloudinaryResult.public_id);
      } catch (cleanupError) {
        console.error("Template Cloudinary cleanup failed:", cleanupError);
      }
    }

    try {
      const refundSession = await mongoose.startSession();

      try {
        await refundSession.withTransaction(async () => {
          const failed = await AIImage.findOneAndUpdate(
            {
              _id: aiImageId,
              user: userId,
              status: AI_GENERATION_STATUS.PROCESSING,
              creditReserved: !unlimited,
            },
            {
              $set: {
                status: AI_GENERATION_STATUS.FAILED,

                errorMessage: "Template image generation failed",

                creditReserved: false,
              },
            },
            {
              new: true,
              session: refundSession,
            },
          );

          // Refund only if a credit was actually reserved.
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
                session: refundSession,
              },
            );
          }
        });
      } finally {
        await refundSession.endSession();
      }
    } catch (refundError) {
      console.error("Template AI credit refund failed:", refundError);
    }

    throw new Error("AI image generation failed");
  }
}

export async function deleteTemplateGeneration(
  userId: string,
  imageId: string,
) {
  if (!userId?.trim()) {
    throw new Error("User ID is required");
  }

  if (!imageId?.trim()) {
    throw new Error("Generation ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new Error("Invalid generation ID");
  }

  const image = await AIImage.findOne({
    _id: imageId,
    user: userId,
    generationType: "template",
  });

  if (!image) {
    throw new Error("Generated template image not found");
  }

  if (image.status === AI_GENERATION_STATUS.PROCESSING) {
    throw new Error(
      "Processing image cannot be deleted yet",
    );
  }
  if (image.cloudinaryPublicId) {
    try {
      const cloudinary = await import(
        "../../config/cloudinary"
      );

      await cloudinary.default.uploader.destroy(
        image.cloudinaryPublicId,
      );
    } catch (error) {
      console.error(
        "Template Cloudinary deletion failed:",
        error,
      );

      throw new Error(
        "Generated image could not be deleted from storage",
      );
    }
  }

  await AIImage.deleteOne({
    _id: image._id,
    user: userId,
    generationType: "template",
  });

  return {
    id: image._id.toString(),
  };
}
export async function getTemplateGenerationById(
  userId: string,
  imageId: string,
) {
  if (!userId?.trim()) {
    throw new Error("User ID is required");
  }

  if (!imageId?.trim()) {
    throw new Error("Generation ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new Error("Invalid generation ID");
  }

  const image = await AIImage.findOne({
    _id: imageId,
    user: userId,
    generationType: "template",
  }).lean();

  if (!image) {
    throw new Error("Generated template image not found");
  }

  return buildTemplateHistoryItem(image);
}

export async function getTemplateGenerationHistory(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
  },
) {
  if (!userId?.trim()) {
    throw new Error("User ID is required");
  }

  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(
    50,
    Math.max(1, options?.limit ?? 20),
  );

  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
    generationType: "template" as const,
  };

  const [images, total] = await Promise.all([
    AIImage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AIImage.countDocuments(filter),
  ]);

  return {
    data: images.map((image) =>
      buildTemplateHistoryItem(image),
    ),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}
