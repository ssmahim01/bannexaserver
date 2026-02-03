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
  return Template.findOne({ slug, isActive: true })
}

export async function getTemplatesByPost(postSlug: string) {
  const post = await Post.findOne({ slug: postSlug });
  if (!post) return [];

  return Template.find({
    post: post._id,
    isActive: true,
  });
}