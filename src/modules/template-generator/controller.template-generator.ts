import { Request, Response } from "express";

import { generateTemplateImageValidation } from "./validation.template-generator";
import {
  deleteTemplateGeneration,
  generateTemplateImage,
  getTemplateGenerationById,
  getTemplateGenerationHistory,
} from "./service.template-generator";

export const generateTemplateImageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validationResult = generateTemplateImageValidation.safeParse(
      req.body,
    );

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid template generation request",
        errors: validationResult.error.flatten(),
      });
    }

    const { category, event, template, values, requestId } =
      validationResult.data;

    const result = await generateTemplateImage({
      userId,
      category,
      event,
      template,
      values,
      requestId,
    });

    return res.status(201).json({
      success: true,
      message: "Template image generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Generate template image controller error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Template image generation failed";

    if (
      errorMessage === "AI_GENERATION_ALREADY_COMPLETED" ||
      errorMessage === "AI_GENERATION_IN_PROGRESS" ||
      errorMessage === "AI_GENERATION_REQUEST_ALREADY_USED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          errorMessage === "AI_GENERATION_ALREADY_COMPLETED"
            ? "This generation request has already been completed."
            : errorMessage === "AI_GENERATION_IN_PROGRESS"
              ? "This generation request is already being processed."
              : "This generation request has already been used.",
      });
    }

    if (
      errorMessage.includes("generation limit") ||
      errorMessage.includes("monthly limit") ||
      errorMessage.includes("AI generation limit") ||
      errorMessage.includes("credits")
    ) {
      return res.status(429).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage === "User not found" ||
      errorMessage.includes("account is not allowed") ||
      errorMessage.includes("subscription information")
    ) {
      return res.status(403).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage.includes("required") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("cannot exceed") ||
      errorMessage.includes("must be") ||
      errorMessage.includes("too long")
    ) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage.includes("Clipdrop") ||
      errorMessage.includes("image generation") ||
      errorMessage.includes("Generated image") ||
      errorMessage.includes("generation failed")
    ) {
      return res.status(502).json({
        success: false,
        message: errorMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate template image",
    });
  }
};

export const getTemplateGenerationHistoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await getTemplateGenerationHistory(userId, {
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Template generation history fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get template generation history controller error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch template generation history";

    if (message.includes("User ID") || message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template generation history",
    });
  }
};

export const getTemplateGenerationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Generation ID is required",
      });
    }

    const result = await getTemplateGenerationById(userId, id as string);

    return res.status(200).json({
      success: true,
      message: "Template generation fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get template generation controller error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch template generation";

    if (message === "Generated template image not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message.includes("required") || message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template generation",
    });
  }
};

export const deleteTemplateGenerationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Generation ID is required",
      });
    }

    const result = await deleteTemplateGeneration(userId, id as string);

    return res.status(200).json({
      success: true,
      message: "Template generation deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete template generation controller error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete template generation";

    if (message === "Generated template image not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (message.includes("required") || message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (message.includes("cannot be deleted")) {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    if (message.includes("storage")) {
      return res.status(502).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete template generation",
    });
  }
};
