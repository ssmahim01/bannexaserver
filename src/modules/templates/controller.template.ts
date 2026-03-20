import { Request, Response } from "express";
import * as templateService from "./service.template";
import { Template } from "./model.template";
import { buildBannerUrl } from "../../utils/cloudinaryRender";
import {
  getMonthlyLimit,
  resetMonthlyDownloadIfNeeded,
} from "../../middlewares/auth.middleware";
import {
  getSignedDownloadUrl,
  uploadToCloudinaryBuffer,
} from "../../utils/cloudinary";
import mongoose from "mongoose";
import User from "../users/model.user";
import { Post } from "../posts/model.post";

async function generateUniquePostSlug(base: string): Promise<string> {
  let slug = base;
  let count = 1;

  while (await Post.exists({ slug })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

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
  })
    .populate("category", "slug name nameEn")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: templates });
}

export async function getMyTemplateByIdController(req: Request, res: Response) {
  try {
    const id = getSingleParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Template id is required",
      });
    }

    const template = await templateService.getTemplateByIdForUser(id, req.user);
    return res.json({ success: true, data: template });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch template",
    });
  }
}

export async function getTemplatePostsController(req: Request, res: Response) {
  try {
    const slug = getSingleParam(req.params.slug);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await templateService.getPostsByTemplateSlug(
      slug,
      page,
      limit,
    );

    return res.json({
      success: true,
      data: result.posts,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template posts",
    });
  }
}

export async function updateTemplateController(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const template = await templateService.updateTemplate(
      id,
      req.body,
      req.user!,
    );
    res.json({ success: true, data: template });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;

    res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update template",
    });
  }
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
    const file = req.file;
    const templateSlug = req.body.templateSlug;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug required",
      });
    }

    if (!file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "File buffer is required",
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

    template.uses += 1;
    await template.save();

    await user.save();

    const existingPost = await Post.findOne({
      template: template._id,
      createdBy: user._id,
    });

    const uploaded = await uploadToCloudinaryBuffer(file.buffer);

    let createdPost = {} as any;

    const baseSlug = `${template.slug}-${Date.now()}`;
    const uniqueSlug = await generateUniquePostSlug(baseSlug);

    if (!existingPost && user?.subscription?.plan === "premium") {
      createdPost = await Post.create({
        title: template.title,
        slug: uniqueSlug,
        postSlug: template.slug || templateSlug,
        image: uploaded.secure_url,
        author: {
          name: user?.fullName || "Admin",
          avatar: user?.profileImage || null,
        },
        caption: "Created using Bannexa Template",
        category: template.category,
        createdBy: user._id,
        template: template._id,
        isTemplateBased: true,
      });
    }

    const signedUrl = getSignedDownloadUrl(template?.baseImagePublicId ?? "");

    if (user.subscription.plan !== "premium") {
      return res.json({
        success: true,
        message: "Downloaded (no post for free user)",
      });
    } else {
      return res.json({
        success: true,
        downloadUrl: signedUrl,
        remaining: limit - user.subscription.downloadUsedThisMonth,
        limit,
        postSlug: createdPost.slug,
      });
    }
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
