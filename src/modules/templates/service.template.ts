import { Types } from "mongoose";
import { Template } from "./model.template";
import { Post } from "../posts/model.post";

export async function createTemplate(payload: any, userId: string) {
  const post = await Post.findOne({ slug: payload.postSlug });
  if (!post) throw new Error("Post not found");

  return Template.create({
    slug: payload.slug,
    title: payload.title,
    previewImage: payload.previewImage,
    canvasWidth: payload.canvasWidth,
    canvasHeight: payload.canvasHeight,
    layers: payload.layers,
    post: post._id,
    createdBy: new Types.ObjectId(userId),
  });
}

export async function getTemplateBySlug(slug: string) {
  return Template.findOne({
    slug,
    isActive: true,
  }).populate("post", "slug caption image");
}

export async function getTemplatesByUser(userId: string) {
  return Template.find({
    createdBy: userId,
    isActive: true,
  })
    .populate("post", "slug caption image")
    .sort({ createdAt: -1 });
}

export async function updateTemplate(
  id: string,
  payload: any,
  user: any
) {
  const template = await Template.findById(id);
  if (!template) throw new Error("Template not found");

  if (
    template.createdBy?.toString() !== user._id &&
    user.role !== "admin"
  ) {
    throw new Error("Forbidden");
  }

  Object.assign(template, payload);
  return template.save();
}

export async function deleteTemplate(id: string, user: any) {
  const template = await Template.findById(id);
  if (!template) throw new Error("Template not found");

  if (
    template.createdBy?.toString() !== user._id &&
    user.role !== "admin"
  ) {
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

