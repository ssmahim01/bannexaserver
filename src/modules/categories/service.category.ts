import { Category } from "./model.category";
import { Types } from "mongoose";
import { Post } from "../posts/model.post";
import { countPostsByCategory } from "../posts/service.post";

export async function createCategory(payload: any, userId: string) {
  const exists = await Category.findOne({ slug: payload.slug });
  if (exists) {
    throw new Error("Category already exists");
  }

  return Category.create({
    ...payload,
    createdBy: new Types.ObjectId(userId),
  });
}

export async function getAllCategories() {
  const categories = await Category.find({ isActive: true });

  return Promise.all(
    categories.map(async (cat) => ({
      ...cat.toObject(),
      templateCount: await countPostsByCategory(cat._id.toString()),
    })),
  );
}

export async function getCategoryBySlug(slug: string) {
  return Category.findOne({ slug, isActive: true });
}

export async function updateCategory(slug: string, payload: any) {
  return Category.findOneAndUpdate({ slug }, payload, { new: true });
}

export async function deleteCategory(slug: string) {
  return Category.findOneAndDelete({ slug });
}
