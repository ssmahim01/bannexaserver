import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    nameEn: z.string().min(2),
    slug: z.string().min(2),
    image: z.string().url(),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    nameEn: z.string().optional(),
    image: z.string().url().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});