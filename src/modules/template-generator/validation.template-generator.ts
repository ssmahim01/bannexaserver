import { z } from "zod";

const identifierSchema = z
  .string()
  .trim()
  .min(1, "Value is required")
  .max(150, "Value cannot exceed 150 characters");

const templateValueSchema = z
  .string()
  .trim()
  .max(500, "Template value cannot exceed 500 characters");

export const generateTemplateImageValidation = z.object({
  requestId: z
    .string()
    .uuid("Invalid template generation request ID"),

  category: identifierSchema,

  event: identifierSchema,

  template: identifierSchema,

  values: z
    .record(z.string(), templateValueSchema)
    .default({}),
});

export type GenerateTemplateImageInput = z.infer<
  typeof generateTemplateImageValidation
>;