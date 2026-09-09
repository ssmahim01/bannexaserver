import { z } from "zod";
import { AI_CATEGORIES } from "./constant.ai-image";

export const generateAIImageValidation = z.object({
  category: z.enum([
    AI_CATEGORIES.ACTOR_VIBE,
    AI_CATEGORIES.ENHANCE,
    AI_CATEGORIES.CINEMATIC,
    AI_CATEGORIES.PROFESSIONAL,
    AI_CATEGORIES.ANIME,
  ]),
});

export type GenerateAIImageInput = z.infer<
  typeof generateAIImageValidation
>;