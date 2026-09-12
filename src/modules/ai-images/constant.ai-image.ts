// import { SubscriptionPlan } from "../users/constant.user";

// export const AI_CATEGORIES = {
//   ACTOR_VIBE: "actor-vibe",
//   ENHANCE: "enhance",
//   CINEMATIC: "cinematic",
//   PROFESSIONAL: "professional",
//   ANIME: "anime",
// } as const;

// export type AIImageCategory =
//   (typeof AI_CATEGORIES)[keyof typeof AI_CATEGORIES];

// export const AI_GENERATION_STATUS = {
//   PROCESSING: "processing",
//   COMPLETED: "completed",
//   FAILED: "failed",
// } as const;

// export type AIGenerationStatus =
//   (typeof AI_GENERATION_STATUS)[keyof typeof AI_GENERATION_STATUS];

// export const AI_PROVIDERS = {
//   HUGGINGFACE: "huggingface",
//   GEMINI: "gemini",
//   OPENAI: "openai",
// } as const;

// export type AIProvider =
//   (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

// export const AI_PLAN_PROVIDERS: Record<
//   SubscriptionPlan,
//   AIProvider
// > = {
//   free: AI_PROVIDERS.HUGGINGFACE,
//   premium: AI_PROVIDERS.GEMINI,
//   professional: AI_PROVIDERS.OPENAI,
//   enterprise: AI_PROVIDERS.OPENAI,
// };

// export const AI_GENERATION_LIMITS: Record<
//   SubscriptionPlan,
//   number
// > = {
//   free: 2,
//   premium: 30,
//   professional: 100,
//   enterprise: 500,
// };

// export const AI_PROMPTS: Record<AIImageCategory, string> = {
//   "actor-vibe": `
// Transform the uploaded portrait into a sophisticated cinematic actor-style portrait.

// Preserve the exact identity of the person in the reference image.
// Maintain the same facial structure, facial proportions, eyes, nose, lips,
// jawline, hairstyle characteristics, skin tone, age, and recognizable identity.

// Do not replace the person with another person.
// Do not create a different face.

// Only transform the visual styling, lighting, clothing, atmosphere,
// background and cinematic presentation.

// Photorealistic result, natural skin texture, realistic facial details.
// `,

//   enhance: `
// Professionally enhance the uploaded photograph.

// Preserve the exact person and facial identity.
// Do not alter the person's facial structure or recognizable features.

// Improve lighting, sharpness, clarity, dynamic range, skin detail
// and overall photographic quality while keeping the original person intact.
// `,

//   cinematic: `
// Transform the uploaded portrait into a premium cinematic photograph.

// Keep the exact same person and preserve their recognizable facial identity,
// facial proportions, eyes, nose, lips, jawline and natural appearance.

// Change primarily the lighting, atmosphere, color grading,
// depth and cinematic environment.

// Photorealistic result with natural skin texture.
// `,

//   professional: `
// Transform the uploaded portrait into a premium professional studio portrait.

// Preserve the exact identity and facial characteristics of the person.
// Do not replace or redesign the face.

// Use professional studio lighting, clean composition,
// natural skin tones and polished photographic quality.
// `,

//   anime: `
// Transform the uploaded portrait into a high-quality anime-inspired
// artistic portrait while retaining the recognizable identity,
// facial proportions, pose and overall composition of the person.

// Do not replace the person with a completely different character.
// `,
// };

import { SubscriptionPlan } from "../users/constant.user";

export const AI_PROVIDERS = {
  OPENROUTER: "openrouter",
} as const;

export type AIProvider =
  (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const AI_MODELS = {
  FREE: "x-ai/grok-imagine-image-quality:free",
  PAID: "bytedance-seed/seedream-5-0-pro",
} as const;

export const AI_PLAN_MODELS: Record<
  SubscriptionPlan,
  string
> = {
  free: AI_MODELS.FREE,
  premium: AI_MODELS.PAID,
  professional: AI_MODELS.PAID,
  enterprise: AI_MODELS.PAID,
};

export const AI_GENERATION_LIMITS: Record<
  SubscriptionPlan,
  number
> = {
  free: 2,
  premium: 30,
  professional: 100,
  enterprise: 500,
};

export const AI_CATEGORIES = {
  ACTOR_VIBE: "actor-vibe",
  ENHANCE: "enhance",
  CINEMATIC: "cinematic",
  PROFESSIONAL: "professional",
  ANIME: "anime",
} as const;

export type AIImageCategory =
  (typeof AI_CATEGORIES)[keyof typeof AI_CATEGORIES];

export const AI_GENERATION_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;