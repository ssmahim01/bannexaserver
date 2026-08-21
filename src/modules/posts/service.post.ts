import { Types } from "mongoose";
import { Post } from "./model.post";
import { Category } from "../categories/model.category";
import { generateSlug } from "../../utils/slug";
import User from "../users/model.user";

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let count = 1;

  while (await Post.exists({ slug })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

export async function createPost(payload: any, userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscription?.plan !== "premium") {
    throw new Error("Only premium users can publish posts");
  }

  const category = await Category.findOne({ slug: payload.categorySlug });

  if (!category) {
    throw new Error("Invalid category");
  }

  const baseSlug = generateSlug(payload.slug || payload.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const post = await Post.create({
    title: payload.title,
    slug: uniqueSlug,
    postSlug: uniqueSlug,
    image: payload.imageUrl || payload.image,
    caption: payload.caption,
    hashtags: payload.hashtags || [],

    isTrending: payload.isTrending,
    isPopular: payload.isPopular,

    category: category._id,

    author: {
      name: payload.author?.name || user.fullName,
      avatar: payload.author?.avatar || user.profileImage || null,
    },

    createdBy: new Types.ObjectId(userId),
    isTemplateBased: false,
  });

  return post;
}

export async function getAllPosts(filter: any = {}) {
  return Post.find({ isActive: true, ...filter })
    .populate("category", "slug name nameEn")
    .populate("template", "slug")
    .sort({ createdAt: -1 });
}

export async function getPostBySlug(slug: string) {
  return Post.findOne({ slug, isActive: true }).populate(
    "category",
    "slug name nameEn",
  );
}

export async function getSavedPostsByUser(userId: Types.ObjectId) {
  const user = await User.findById(userId).populate({
    path: "savedPosts",
    match: { isActive: true },
    populate: {
      path: "category",
      select: "slug name nameEn",
    },
  });

  if (!user) throw new Error("User not found");

  return user.savedPosts;
}

export async function getPostsByUser(userId: string) {
  return Post.find({
    createdBy: new Types.ObjectId(userId),
    isActive: true,
  })
    .populate("category", "slug name nameEn")
    .sort({ createdAt: -1 });
}

export async function updatePost(postId: string, payload: any, user: any) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.createdBy?.toString() !== user.id && user.role !== "admin") {
    throw new Error("Forbidden");
  }

  Object.assign(post, payload);
  return post.save();
}

export async function deletePost(postId: string, user: any) {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.createdBy?.toString() !== user.id && user.role !== "admin") {
    throw new Error("Forbidden");
  }

  post.isActive = false;
  await post.save();
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
  return Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
}

export async function sharePost(postId: string) {
  return Post.findByIdAndUpdate(postId, { $inc: { shares: 1 } }, { new: true });
}
