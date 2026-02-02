import { z } from "zod";

export const createTemplateSchema = z.object({
  body: z.object({
    slug: z.string().min(3),
    title: z.string().min(3),
    previewImage: z.string().url(),

    canvasWidth: z.number().min(100),
    canvasHeight: z.number().min(100),

    layers: z.array(
      z.object({
        type: z.enum(["image", "text"]),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
        fontSize: z.number().optional(),
        color: z.string().optional(),
        placeholder: z.boolean().optional(),
      })
    ),

    postSlug: z.string(),
  }),
});