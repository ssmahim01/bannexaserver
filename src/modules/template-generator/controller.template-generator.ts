import { Request, Response } from "express";
import { Types } from "mongoose";

import { generateTemplateImageValidation } from "./validation.template-generator";

import {
  getGeneratorCategories,
  getGeneratorEvents,
  getGeneratorTemplates,
  getGeneratorTemplate,
  generateTemplateImage,
} from "./service.template-generator";

export const getGeneratorCategoriesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories = await getGeneratorCategories();

    return res.status(200).json({
      success: true,
      message: "Template generator categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Get generator categories controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template generator categories",
    });
  }
};

export const getGeneratorEventsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { categoryId } = req.params;

    if (!Types.ObjectId.isValid(categoryId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const events = await getGeneratorEvents(categoryId as string);

    return res.status(200).json({
      success: true,
      message: "Template generator events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Get generator events controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch template generator events",
    });
  }
};

export const getGeneratorTemplatesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { eventId } = req.params;

    if (!Types.ObjectId.isValid(eventId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const templates = await getGeneratorTemplates(eventId as string);

    return res.status(200).json({
      success: true,
      message: "Generator templates fetched successfully",
      data: templates,
    });
  } catch (error) {
    console.error("Get generator templates controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch generator templates",
    });
  }
};

export const getGeneratorTemplateController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { templateId } = req.params;

    if (!Types.ObjectId.isValid(templateId as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
    }

    const template = await getGeneratorTemplate(templateId as string);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Generator template fetched successfully",
      data: template,
    });
  } catch (error) {
    console.error("Get generator template controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch generator template",
    });
  }
};

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

    const { templateId, requestId, values } = validationResult.data;

    const result = await generateTemplateImage({
      userId,
      templateId,
      requestId,
      values,
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
      errorMessage.includes("Template not found") ||
      errorMessage.includes("template not found")
    ) {
      return res.status(404).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage.includes("Invalid") ||
      errorMessage.includes("required") ||
      errorMessage.includes("cannot exceed") ||
      errorMessage.includes("not allowed") ||
      errorMessage.includes("must be")
    ) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage === "User not found" ||
      errorMessage.includes("account is") ||
      errorMessage.includes("subscription is inactive")
    ) {
      return res.status(403).json({
        success: false,
        message: errorMessage,
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
      errorMessage.includes("already processing") ||
      errorMessage.includes("already completed")
    ) {
      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    if (
      errorMessage.includes("Clipdrop") ||
      errorMessage.includes("generation failed") ||
      errorMessage.includes("image generation")
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
