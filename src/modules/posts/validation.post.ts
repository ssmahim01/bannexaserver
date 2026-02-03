import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId",
});

export const createPostSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),

  image: z.string().url("Image must be a valid URL"),

  caption: z
    .string()
    .min(5, "Caption is too short")
    .max(1000, "Caption is too long"),

  hashtags: z
    .array(
      z
        .string()
        .min(1)
        .max(30)
        .regex(/^#[a-zA-Z0-9_]+$/, "Invalid hashtag"),
    )
    .max(20)
    .optional()
    .default([]),

  category: objectIdSchema,

  author: z.object({
    name: z.string().min(2).max(100),
    avatar: z.string().url().nullable().optional(),
  }),
});

export const updatePostSchema = createPostSchema.partial();
