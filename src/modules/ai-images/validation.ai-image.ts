import { z } from "zod";
import { AI_CATEGORIES } from "./constant.ai-image";

const aiCategoryValues = [
  AI_CATEGORIES.ACTOR_VIBE,
  AI_CATEGORIES.ENHANCE,
  AI_CATEGORIES.CINEMATIC,
  AI_CATEGORIES.PROFESSIONAL,
  AI_CATEGORIES.ANIME,
  AI_CATEGORIES.NINETIES_NOSTALGIA,
  AI_CATEGORIES.DURGA_PUJA,
  AI_CATEGORIES.OLD_MONEY,
  AI_CATEGORIES.VINTAGE_FILM,
  AI_CATEGORIES.STREET_STYLE,
  AI_CATEGORIES.ROYAL_PORTRAIT,
  AI_CATEGORIES.CYBERPUNK,
  AI_CATEGORIES.MONSOON_MOOD,
] as const;

export const generateAIImageValidation = z.object({
  category: z.enum(aiCategoryValues, {
    message: "Invalid AI generation category",
  }),
});

export type GenerateAIImageInput = z.infer<
  typeof generateAIImageValidation
>;