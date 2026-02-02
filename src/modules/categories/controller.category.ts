import { Request, Response } from "express";
import * as categoryService from "./service.category";

export async function getCategoriesController(req: Request, res: Response) {
  const data = await categoryService.getAllCategories();
  return res.json({ success: true, data });
}

export async function getCategoryController(req: Request, res: Response) {
  const { slug } = req.params;

  const category = await categoryService.getCategoryBySlug(slug);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  return res.json({ success: true, data: category });
}

export async function createCategoryController(req: Request, res: Response) {
  const user = req.user!;
  const category = await categoryService.createCategory(req.body, user.id);
  return res.status(201).json({ success: true, data: category });
}

export async function updateCategoryController(req: Request, res: Response) {
  const { slug } = req.params;
  const updated = await categoryService.updateCategory(slug, req.body);
  return res.json({ success: true, data: updated });
}

export async function deleteCategoryController(req: Request, res: Response) {
  const { slug } = req.params;
  await categoryService.deleteCategory(slug);
  return res.json({ success: true });
}