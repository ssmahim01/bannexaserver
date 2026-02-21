import { Types } from "mongoose";
import { Template } from "./model.template";
import { Post } from "../posts/model.post";
import { generateSlug } from "../../utils/slug";
import { Category } from "../categories/model.category";

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
    throw new Error("Invalid category");
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
    canvasHeight: payload.canvasHeight,
    createdBy: new Types.ObjectId(userId),
  });
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

export async function updateTemplate(id: string, payload: any, user: any) {
  const template = await Template.findById(id);
  if (!template) throw new Error("Template not found");

  if (template.createdBy?.toString() !== user._id && user.role !== "admin") {
    throw new Error("Forbidden");
  }

  Object.assign(template, payload);
  return template.save();
}

export async function deleteTemplate(id: string, user: any) {
  const template = await Template.findById(id);
  if (!template) throw new Error("Template not found");

  if (template.createdBy?.toString() !== user._id && user.role !== "admin") {
    throw new Error("Forbidden");
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
