export const AI_PROVIDERS = {
  GEMINI: "gemini",
  OPENAI: "openai",
} as const;

export type AIProvider =
  (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

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

export type AIGenerationStatus =
  (typeof AI_GENERATION_STATUS)[keyof typeof AI_GENERATION_STATUS];

export const AI_GENERATION_LIMITS = {
  free: 2,
  premium: 30,
  professional: 100,
  enterprise: 500,
} as const;

export const AI_PLAN_PROVIDERS = {
  free: AI_PROVIDERS.GEMINI,
  premium: AI_PROVIDERS.OPENAI,
  professional: AI_PROVIDERS.OPENAI,
  enterprise: AI_PROVIDERS.OPENAI,
} as const;

export const AI_PROMPTS: Record<AIImageCategory, string> = {
  "actor-vibe":
    "Transform the provided person's photo into a cinematic celebrity-inspired portrait. Preserve the person's recognizable identity, facial structure, skin tone, and natural appearance while applying a sophisticated cinematic visual style.",

  enhance:
    "Professionally enhance the provided image. Improve clarity, lighting, sharpness, dynamic range and overall visual quality while preserving the original person's identity and natural appearance.",

  cinematic:
    "Transform the provided photo into a high-quality cinematic portrait with dramatic professional lighting, realistic skin texture, depth and a polished cinematic atmosphere while preserving the person's identity.",

  professional:
    "Transform the provided photo into a professional studio portrait with clean lighting, realistic details, polished composition and natural skin tones while preserving the person's identity.",

  anime:
    "Transform the provided photo into a high-quality anime-inspired artistic portrait while preserving recognizable facial characteristics, pose and overall composition.",
};