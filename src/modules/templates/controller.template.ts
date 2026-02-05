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

export const getSingleParam = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

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
  const templates = await templateService.getTemplatesByUser(req.user?._id);
  res.json({ success: true, data: templates });
}

// PUT
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
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;
    const slug = getSingleParam(req.params.slug);

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
        error: "Template not found. Please verify the template URL.",
      });
    }

    // Initialize user subscription if not exists
    if (!user.subscription) {
      user.subscription = {
        plan: "free",
        downloadUsedThisMonth: 0,
        resetDate: new Date(),
      };
    }

    // Initialize user stats if not exists
    if (!user.stats) {
      user.stats = {
        totalDownloads: 0,
      };
    }

    // Reset monthly download count if needed
    resetMonthlyDownloadIfNeeded(user);

    // Get download limit based on plan
    const limit = getMonthlyLimit(user.subscription.plan || "free");

    // Check if user has exceeded download limit
    if (user.subscription.downloadUsedThisMonth >= limit) {
      return res.status(403).json({
        success: false,
        message: "Monthly download limit exceeded",
        limit: limit,
        used: user.subscription.downloadUsedThisMonth,
        plan: user.subscription.plan,
      });
    }

    // Increment download counters
    user.subscription.downloadUsedThisMonth += 1;
    user.stats.totalDownloads += 1;

    // Initialize template downloads if not exists
    if (typeof template.downloads !== "number" || isNaN(template.downloads)) {
      template.downloads = 0;
    }
    template.downloads += 1;

    // Save both user and template (use Promise.all for better performance)
    await Promise.all([user.save(), template.save()]);

    // Generate signed Cloudinary URL
    const signedUrl = getSignedDownloadUrl(template?.baseImagePublicId ?? "");

    return res.json({
      success: true,
      downloadUrl: signedUrl,
      remaining: limit - user.subscription.downloadUsedThisMonth,
      limit: limit,
      templateName: template.title,
      templateId: template._id,
    });
  } catch (error) {
    console.error("❌ Download Template Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download template",
      error: process.env.NODE_ENV === "development" ? error : undefined,
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
    const template = await templateService.createTemplate(req.body, user.id);

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
