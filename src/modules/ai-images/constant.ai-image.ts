import { SubscriptionPlan } from "../users/constant.user";

export const AI_PROVIDERS = {
  HUGGINGFACE: "huggingface",
  GEMINI: "gemini",
  OPENROUTER: "openrouter",
} as const;

export type AIProvider =
  (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const AI_MODELS = {
  FREE: "Qwen/Qwen-Image-Edit",

  GEMINI: "gemini-3.1-flash-image",

  PAID: "bytedance-seed/seedream-5-0-pro",
} as const;

export const AI_GENERATION_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const AI_PLAN_PROVIDERS: Record<
  SubscriptionPlan,
  AIProvider
> = {
  free: AI_PROVIDERS.HUGGINGFACE,

  premium: AI_PROVIDERS.GEMINI,

  professional: AI_PROVIDERS.OPENROUTER,

  enterprise: AI_PROVIDERS.OPENROUTER,
};

export const AI_PLAN_MODELS: Record<
  SubscriptionPlan,
  string
> = {
  free: AI_MODELS.FREE,

  premium: AI_MODELS.GEMINI,

  professional: AI_MODELS.PAID,

  enterprise: AI_MODELS.PAID,
};

export const AI_GENERATION_LIMITS: Record<
  SubscriptionPlan,
  number
> = {
  free: 2,
  premium: 15,
  professional: 50,
  enterprise: Infinity,
};

export const AI_UNLIMITED_PLANS: SubscriptionPlan[] = [
  "enterprise",
];

export const AI_CATEGORIES = {
  ACTOR_VIBE: "actor-vibe",
  ENHANCE: "enhance",
  CINEMATIC: "cinematic",
  PROFESSIONAL: "professional",
  ANIME: "anime",

  NINETIES_NOSTALGIA: "90s-nostalgia",
  DURGA_PUJA: "durga-puja",
  OLD_MONEY: "old-money",
  VINTAGE_FILM: "vintage-film",
  STREET_STYLE: "street-style",
  ROYAL_PORTRAIT: "royal-portrait",
  CYBERPUNK: "cyberpunk",
  MONSOON_MOOD: "monsoon-mood",
} as const;

export type AIImageCategory =
  (typeof AI_CATEGORIES)[keyof typeof AI_CATEGORIES];

