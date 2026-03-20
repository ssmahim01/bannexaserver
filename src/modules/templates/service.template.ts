import { Types } from "mongoose";
import { Template } from "./model.template";
import { Post } from "../posts/model.post";
import { generateSlug } from "../../utils/slug";
import { Category } from "../categories/model.category";

function createHttpError(statusCode: number, message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let count = 1;

  while (await Template.exists({ slug })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

export function getPublicTemplates() {
  return Template.find({ isActive: true })
    .populate("category", "slug name nameEn")
    .sort({ createdAt: -1 });
}

export function getAllTemplates() {
  return Template.find()
    .populate("category", "slug name nameEn")
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });
}

export async function createTemplate(payload: any, userId: Types.ObjectId) {
  const baseSlug = generateSlug(payload.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);
  const category = await Category.findOne({ slug: payload.categorySlug });
  if (!category) {
    throw createHttpError(400, "Invalid category");
  }

  return Template.create({
    slug: uniqueSlug,
    title: payload.title,
    category: category?._id,
    categoryName: category?.nameEn || category?.name || "Uncategorized",
    previewImage: payload.previewImage,
    canvasWidth: payload.canvasWidth,
    author: {
      name: payload.author?.name || "User",
      avatar: payload.author?.avatar || null,
    },
    isPremium: Boolean(payload.isPremium),
    canvasHeight: payload.canvasHeight,
    createdBy: new Types.ObjectId(userId),
  });
}

export async function getPostsByTemplateSlug(
  slug: string,
  page = 1,
  limit = 12,
) {
  const template = await Template.findOne({ slug, isActive: true });

  if (!template) return { posts: [], total: 0 };

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({
      template: template._id,
      isActive: true,
    })
      .populate("category", "slug name nameEn")
      .populate("createdBy", "fullName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments({
      template: template._id,
      isActive: true,
    }),
  ]);

  return { posts, total };
}

export async function getTemplateBySlug(slug: string) {
  return Template.findOne({
    slug,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .populate("category", "slug name nameEn")
    .populate("createdBy", "fullName");
}

export async function getTemplatesByUser(userId: string) {
  return Template.find({
    createdBy: new Types.ObjectId(userId),
    isActive: true,
  })
    .populate("category", "slug name nameEn")
    .sort({ createdAt: -1 });
}

export async function getTemplateByIdForUser(id: string, user: any) {
  const template = await Template.findOne({
    _id: id,
    isActive: true,
  }).populate("category", "slug name nameEn");

  if (!template) {
    throw createHttpError(404, "Template not found");
  }

  const isOwner = template.createdBy?.toString() === user._id?.toString();
  if (!isOwner && user.role !== "admin") {
    throw createHttpError(403, "Forbidden");
  }

  return template;
}

export async function updateTemplate(id: string, payload: any, user: any) {
  const template = await Template.findById(id);
  if (!template) throw createHttpError(404, "Template not found");

  if (template.createdBy?.toString() !== user._id?.toString() && user.role !== "admin") {
    throw createHttpError(403, "Forbidden");
  }

  if (typeof payload.title === "string") {
    template.title = payload.title.trim();
  }

  if (typeof payload.previewImage === "string" && payload.previewImage.trim()) {
    template.previewImage = payload.previewImage;
  }

  if (typeof payload.canvasWidth === "number") {
    template.canvasWidth = payload.canvasWidth;
  }

  if (typeof payload.canvasHeight === "number") {
    template.canvasHeight = payload.canvasHeight;
  }

  if (typeof payload.isPremium === "boolean") {
    template.isPremium = payload.isPremium;
  }

  if (payload.author) {
    template.author = {
      name: payload.author?.name || template.author?.name || "User",
      avatar:
        payload.author?.avatar === undefined
          ? template.author?.avatar || null
          : payload.author.avatar,
    };
  }

  if (typeof payload.categorySlug === "string" && payload.categorySlug.trim()) {
    const category = await Category.findOne({ slug: payload.categorySlug });
    if (!category) {
      throw createHttpError(400, "Invalid category");
    }

    template.category = category._id;
    template.categoryName = category.nameEn || category.name || "Uncategorized";
  }

  return template.save();
}

export async function deleteTemplate(id: string, user: any) {
  const template = await Template.findById(id);
  if (!template) throw createHttpError(404, "Template not found");

  if (template.createdBy?.toString() !== user._id?.toString() && user.role !== "admin") {
    throw createHttpError(403, "Forbidden");
  }

  template.isActive = false;
  await template.save();
}

export async function getTemplatesByPostSlug(postSlug: string) {
  const post = await Post.findOne({ slug: postSlug, isActive: true });
  if (!post) return [];

  return Template.find({
    post: post._id,
    isActive: true,
  }).sort({ createdAt: -1 });
}
