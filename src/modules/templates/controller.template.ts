import { Request, Response } from "express";
import * as templateService from "./service.template";
import { Template } from "./model.template";
import { buildBannerUrl } from "../../utils/cloudinaryRender";
import {
  getMonthlyLimit,
  resetMonthlyDownloadIfNeeded,
} from "../../middlewares/auth.middleware";
import { getSignedDownloadUrl } from "../../utils/cloudinary";
import mongoose from "mongoose";
import { Types } from "mongoose";
import User from "../users/model.user";

export const getSingleParam = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

export async function getPublicTemplates(req: Request, res: Response) {
  const templates = await templateService.getPublicTemplates();
  res.json({ success: true, data: templates });
}

export async function getAllTemplatesAdmin(req: Request, res: Response) {
  const templates = await templateService.getAllTemplates();
  res.json({ success: true, data: templates });
}

export async function getTemplateController(req: Request, res: Response) {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: "Slug parameter is required",
      });
    }

    const template = await templateService.getTemplateBySlug(slug);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: "Template not found",
      });
    }

    return res.json({ success: true, data: template });
  } catch (error) {
    console.error("❌ Get Template Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}

export async function renderTemplateController(req: Request, res: Response) {
  try {
    const slug = getSingleParam(req.params.slug);
    const { layers } = req.body;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: "Slug parameter is required",
      });
    }

    // Try finding by slug first
    let template = await Template.findOne({ slug });

    // If not found by slug, try by MongoDB ObjectId
    if (!template && mongoose.Types.ObjectId.isValid(slug)) {
      template = await Template.findById(slug);
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        error: "Template not found. Please check the template URL.",
      });
    }

    const user = req?.user;

    const isPremium = user?.subscription.plan === "premium";

    const url = buildBannerUrl(
      template?.baseImagePublicId ?? "",
      layers,
      template.canvasWidth,
      template.canvasHeight,
    );

    return res.json({
      success: true,
      downloadUrl: url,
      templateId: template._id,
      templateName: template.title,
    });
  } catch (error) {
    console.error("❌ Render Template Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to render template",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}

export async function getMyTemplatesController(req: Request, res: Response) {
  const userId = req.user._id;

  const templates = await Template.find({
    createdBy: userId,
    isActive: true,
  }).populate("category", "slug name nameEn").sort({ createdAt: -1 });

  res.json({ success: true, data: templates });
}

export async function updateTemplateController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const template = await templateService.updateTemplate(
    id,
    req.body,
    req.user!,
  );
  res.json({ success: true, data: template });
}

// DELETE
export async function deleteTemplateController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await templateService.deleteTemplate(id, req.user!);
  res.json({ success: true });
}

export async function downloadTemplateController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const slug = getSingleParam(req.params.slug);
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug required",
      });
    }

    const template = await Template.findOne({ slug, isActive: true });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Reset if needed
    resetMonthlyDownloadIfNeeded(user);

    const limit = getMonthlyLimit(user.subscription.plan);

    if (user.subscription.downloadUsedThisMonth >= limit) {
      return res.status(403).json({
        success: false,
        message: "Monthly download limit exceeded",
        limit,
        used: user.subscription.downloadUsedThisMonth,
      });
    }

    user.subscription.downloadUsedThisMonth += 1;
    user.stats.totalDownloads += 1;

    template.downloads += 1;

    await Promise.all([user.save(), template.save()]);

    const signedUrl = getSignedDownloadUrl(template?.baseImagePublicId ?? "");

    return res.json({
      success: true,
      downloadUrl: signedUrl,
      remaining: limit - user.subscription.downloadUsedThisMonth,
      limit,
    });
  } catch (error) {
    console.error("❌ Download Error:", error);
    return res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
}

export async function createTemplateController(req: Request, res: Response) {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;
    const template = await templateService.createTemplate(req.body, user._id);

    return res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("❌ Create Template Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create template",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
