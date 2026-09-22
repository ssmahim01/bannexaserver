import mongoose from "mongoose";

import User from "../users/model.user";
import AIImage from "../ai-images/model.ai-image";

import GeneratorCategory from "./model.generator-category";
import GeneratorEvent from "./model.generator-event";
import GeneratorTemplate from "./model.generator-template";

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

import {
  GenerateTemplateImagePayload,
  IGeneratorTemplate,
} from "./interface.template-generator";

function getNextMonthResetDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
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

function validateTemplateValues(
  template: IGeneratorTemplate,
  values: Record<string, unknown>,
) {
  for (const field of template.fields) {
    const value = values[field.key];

    if (
      field.required &&
      (value === undefined || value === null || String(value).trim() === "")
    ) {
      throw new Error(`Template field "${field.label}" is required`);
    }

    if (value === undefined || value === null || String(value).trim() === "") {
      continue;
    }

    if (field.maxLength && String(value).length > field.maxLength) {
      throw new Error(
        `${field.label} cannot exceed ${field.maxLength} characters`,
      );
    }

    if (field.type === "select") {
      const allowedValues = field.options?.map((option) => option.value) ?? [];

      if (!allowedValues.includes(String(value))) {
        throw new Error(`Invalid value for ${field.label}`);
      }
    }
  }

  const allowedKeys = new Set(template.fields.map((field) => field.key));

  for (const key of Object.keys(values)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`Invalid template field: ${key}`);
    }
  }
}

function buildTemplatePrompt(
  template: IGeneratorTemplate,
  values: Record<string, unknown>,
) {
  let prompt = template.promptTemplate;

  for (const field of template.fields) {
    const value = values[field.key];

    if (value === undefined || value === null || String(value).trim() === "") {
      continue;
    }

    prompt = prompt.replace(
      new RegExp(`{{\\s*${field.key}\\s*}}`, "g"),
      String(value).trim(),
    );
  }

  const selectedOptions = template.fields
    .map((field) => {
      const value = values[field.key];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return null;
      }

      return `${field.label}: ${String(value).trim()}`;
    })
    .filter(Boolean)
    .join("\n");

  return `
${prompt}

SELECTED DESIGN OPTIONS:
${selectedOptions || "None"}

IMAGE GENERATION REQUIREMENTS:
- Professional commercial-quality design
- Strong visual hierarchy
- Balanced composition
- High-quality visual details
- Suitable for social media
- Premium creative appearance
- Clean and visually coherent composition
- No watermark
- No random logos
`.trim();
}

export async function getGeneratorCategories() {
  return GeneratorCategory.find({
    isActive: true,
  })
    .sort({
      sortOrder: 1,
      name: 1,
    })
    .lean();
}

export async function getGeneratorEvents(categoryId: string) {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new Error("Generator category not found");
  }

  return GeneratorEvent.find({
    category: categoryId,
    isActive: true,
  })
    .sort({
      sortOrder: 1,
      name: 1,
    })
    .lean();
}

export async function getGeneratorTemplates(eventId: string) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new Error("Generator event not found");
  }

  return GeneratorTemplate.find({
    event: eventId,
    isActive: true,
  })
    .sort({
      sortOrder: 1,
      name: 1,
    })
    .lean();
}

export async function getGeneratorTemplate(templateId: string) {
  if (!mongoose.isValidObjectId(templateId)) {
    throw new Error("Generator template not found");
  }

  const template = await GeneratorTemplate.findOne({
    _id: templateId,
    isActive: true,
  }).lean();

  if (!template) {
    throw new Error("Generator template not found");
  }

  return template;
}

/* -------------------------------------------------------------------------- */
/* Generate Template Image                                                    */
/* -------------------------------------------------------------------------- */

export async function generateTemplateImage(
  payload: GenerateTemplateImagePayload,
) {
  const { userId, templateId, values, requestId } = payload;

  /* ------------------------------- Validate ------------------------------ */

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!templateId) {
    throw new Error("Template ID is required");
  }

  if (!requestId) {
    throw new Error("Template generation request ID is required");
  }

  if (requestId.length > 100) {
    throw new Error("Invalid template generation request ID");
  }

  if (!mongoose.isValidObjectId(templateId)) {
    throw new Error("Generator template not found");
  }

  /* --------------------------- Load template ----------------------------- */

  const template = await GeneratorTemplate.findOne({
    _id: templateId,
    isActive: true,
  }).lean();

  if (!template) {
    throw new Error("Generator template not found");
  }

  /* ------------------------- Validate selections ------------------------- */

  validateTemplateValues(template, values);

  /* ------------------------------- User ---------------------------------- */

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

  /* ---------------------------- Usage reset ------------------------------- */

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

  const prompt = buildTemplatePrompt(template, values);

  let aiImage: mongoose.HydratedDocument<IAIImage> | null = null;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      /*
       * Idempotency check
       */
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

        category: null,

        generationType: "template",

        templateId: template._id,

        templateSelections: values,

        provider: AI_PROVIDERS.CLIPDROP,

        model: "clipdrop-text-to-image",

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
  } finally {
    await session.endSession();
  }

  if (!aiImage) {
    throw new Error("Template generation could not be initialized");
  }

  const aiImageData = aiImage as any;
  const aiImageId = aiImageData?._id;

  let cloudinaryResult: any = null;

  try {
    const generated = await generateWithClipdrop({
      prompt,
    });

    if (!generated?.buffer?.length) {
      throw new Error("Clipdrop did not return a generated image");
    }

    if (generated.buffer.length > 15 * 1024 * 1024) {
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

    return {
      id: completed._id,

      image: completed.image,

      templateId: completed.templateId,

      generationType: completed.generationType,

      provider: completed.provider,

      model: completed.model,

      status: completed.status,

      createdAt: completed.createdAt,

      plan,

      usage: {
        used,

        limit: unlimited ? null : limit,

        remaining: unlimited ? null : Math.max(limit - used, 0),

        unlimited,
      },
    };
  } catch (error: unknown) {
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
