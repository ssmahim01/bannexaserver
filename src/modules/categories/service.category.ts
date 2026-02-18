import { Category } from "./model.category";
import { Types } from "mongoose";
import { countPostsByCategory } from "../posts/service.post";
import { generateSlug } from "../../utils/slug";

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let count = 1;

  while (await Category.exists({ slug })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

export async function createCategory(payload: any, userId: string) {
  const baseSlug = generateSlug(payload.slug || payload.nameEn);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  const exists = await Category.findOne({ slug: payload.slug });
  if (exists) {
    throw new Error("Category already exists");
  }

  return Category.create({
    slug: uniqueSlug,
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
