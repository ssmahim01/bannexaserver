import { Types } from "mongoose";
import { Post } from "./model.post";
import { Category } from "../categories/model.category";

export async function createPost(payload: any, userId: string) {
  const category = await Category.findOne({ slug: payload.categorySlug });
  if (!category) {
    throw new Error("Invalid category");
  }

  const post = await Post.create({
    slug: payload.slug,
    image: payload.image,
    caption: payload.caption,
    hashtags: payload.hashtags || [],

    isTrending: payload.isTrending,
    isPopular: payload.isPopular,

    category: category._id,

    author: {
      name: payload.author?.name || "Admin",
      avatar: payload.author?.avatar || null,
    },

    createdBy: new Types.ObjectId(userId),
  });

  return post;
}

export async function getAllPosts(filter: any = {}) {
  return Post.find({ isActive: true, ...filter })
    .populate("category", "slug name nameEn")
    .sort({ createdAt: -1 });
}

export async function getPostBySlug(slug: string) {
  return Post.findOne({ slug, isActive: true })
    .populate("category", "slug name nameEn");
}

export async function getPostsByCategory(categorySlug: string) {
  const category = await Category.findOne({ slug: categorySlug });
  if (!category) return [];

  return Post.find({
    category: category._id,
    isActive: true,
  }).sort({ createdAt: -1 });
}

export async function countPostsByCategory(categoryId: string) {
  return Post.countDocuments({
    category: categoryId,
    isActive: true,
  });
}

export async function likePost(postId: string) {
  return Post.findByIdAndUpdate(
    postId,
    { $inc: { likes: 1 } },
    { new: true }
  );
}

export async function sharePost(postId: string) {
  return Post.findByIdAndUpdate(
    postId,
    { $inc: { shares: 1 } },
    { new: true }
  );
}