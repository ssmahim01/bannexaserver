import { Request, Response } from "express";

import { generateAIImageValidation } from "./validation.ai-image";
import { generateAIImage } from "./service.ai-image";
import { getAIUsage } from "./service.ai-image";

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

    const { category } = validation.data;

    const result = await generateAIImage({
      userId: req.user._id.toString(),

      category,

      imageBuffer: req.file.buffer,

      mimeType: req.file.mimetype,
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
      "Subscription plan not found",
      "Your subscription is inactive",
      "AI provider is not configured for this plan",
      "AI generation limit is not configured for this plan",
      "Your account is not allowed to use AI",
      "Only image files are allowed",
    ];

    if (badRequestMessages.some((item) => message === item)) {
      return res.status(400).json({
        success: false,
        message,
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
      message.includes("AI image generation failed") ||
      message.includes("did not return a generated image")
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


export async function getAIUsageController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const usage = await getAIUsage(
      req.user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "AI usage fetched successfully",
      data: usage,
    });
  } catch (error: unknown) {
    console.error("Get AI usage error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch AI usage";

    if (message === "User not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message === "Subscription information not found" ||
      message ===
        "AI generation limit is not configured for this plan"
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