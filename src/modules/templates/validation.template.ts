import { Types } from "mongoose";
import { z } from "zod";
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId",
});

export const createTemplateSchema = z.object({
  body: z.object({
    slug: z.string().min(3),
    title: z.string().min(3),
    previewImage: z.string().url(),

    canvasWidth: z.number().min(100),
    canvasHeight: z.number().min(100),
    caption: z
      .string()
      .min(5, "Caption is too short")
      .max(1000, "Caption is too long"),
    category: objectIdSchema,

    // layers: z.array(
    //   z.object({
    //     type: z.enum(["image", "text"]),
    //     x: z.number(),
    //     y: z.number(),
    //     width: z.number().optional(),
    //     height: z.number().optional(),
    //     fontSize: z.number().optional(),
    //     color: z.string().optional(),
    //     placeholder: z.boolean().optional(),
    //   })
    // ),
  }),
});
