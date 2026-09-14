import { Request, Response } from "express";

import { generateAIImageValidation } from "./validation.ai-image";
import {
  deleteMyAIImage,
  generateAIImage,
  getAIUsage,
  getMyAIGenerations,
  getMyAIImage,
} from "./service.ai-image";

export async function generateAIImageController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const validation = generateAIImageValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI generation request",
        errors: validation.error.flatten(),
      });
    }

    const { category, requestId } = validation.data;

    const result = await generateAIImage({
      userId: req.user._id.toString(),

      category,

      imageBuffer: req.file.buffer,

      mimeType: req.file.mimetype,

      requestId,
    });

    return res.status(200).json({
      success: true,
      message: "AI image generated successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Generate AI image controller error:", error);

    const message =
      error instanceof Error ? error.message : "AI image generation failed";

    const badRequestMessages = [
      "Image is required",
      "AI category is required",
      "Invalid AI generation category",
      "Subscription information not found",
      "AI generation request ID is required",
      "Invalid AI generation request ID",
      "AI generation request ID is too long",
      "Subscription plan not found",
      "Your subscription is inactive",
      "AI provider is not configured for this plan",
      "AI generation limit is not configured for this plan",
      "Your account is not allowed to use AI",
      "Only image files are allowed",
    ];

    if (badRequestMessages.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (message === "AI_GENERATION_IN_PROGRESS") {
      return res.status(409).json({
        success: false,
        message: "This AI generation is already in progress.",
      });
    }

    if (message === "AI_GENERATION_REQUEST_ALREADY_USED") {
      return res.status(409).json({
        success: false,
        message:
          "This generation request has already been used. Please start a new generation.",
      });
    }

    if (message.includes("monthly AI generation limit")) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    if (message.includes("API is not configured")) {
      return res.status(503).json({
        success: false,
        message: "AI service is temporarily unavailable",
      });
    }

    if (message === "User not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message.includes("OpenRouter image generation failed") ||
      message.includes("OpenRouter did not return") ||
      message.includes("Hugging Face image generation failed") ||
      message.includes("Hugging Face did not return") ||
      message.includes("AI image generation failed") ||
      message.includes("Generated image could not be saved")
    ) {
      return res.status(502).json({
        success: false,
        message: "AI image generation failed. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating the image",
    });
  }
}

export async function deleteMyAIImageController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { imageId } = req.params;

    await deleteMyAIImage(req.user._id.toString(), imageId as string);

    return res.status(200).json({
      success: true,
      message: "AI image deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete AI image error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to delete AI image";

    if (message === "AI image not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete AI image",
    });
  }
}

export async function getMyAIImageController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { imageId } = req.params;

    const result = await getMyAIImage(
      req.user._id.toString(),
      imageId as string,
    );

    return res.status(200).json({
      success: true,
      message: "AI image fetched successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Get AI image error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to fetch AI image";

    if (message === "AI image not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch AI image",
    });
  }
}

export async function getMyAIGenerationsController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const result = await getMyAIGenerations(
      req.user._id.toString(),
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "AI generations fetched successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Get my AI generations error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch AI generations",
    });
  }
}

export async function getAIUsageController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const usage = await getAIUsage(req.user._id.toString());

    return res.status(200).json({
      success: true,
      message: "AI usage fetched successfully",
      data: usage,
    });
  } catch (error: unknown) {
    console.error("Get AI usage error:", error);

    const message =
      error instanceof Error ? error.message : "Unable to fetch AI usage";

    if (message === "User not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message === "Subscription information not found" ||
      message === "AI generation limit is not configured for this plan"
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch AI usage",
    });
  }
}
