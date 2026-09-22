import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid ID",
  );

export const generateTemplateImageValidation =
  z.object({
    templateId: objectIdSchema,

    requestId: z.string().uuid(
      "Invalid template generation request ID",
    ),

    values: z
      .record(z.string(), z.unknown())
      .default({}),
  });

export type GenerateTemplateImageInput = z.infer<
  typeof generateTemplateImageValidation
>;