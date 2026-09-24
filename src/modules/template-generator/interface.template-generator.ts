export interface GenerateTemplateImagePayload {
  userId: string;
  requestId: string;

  category: string;
  event: string;
  template: string;

  values: Record<string, string>;
}

export interface TemplateGenerationReferences {
  category: string;
  event: string;
  template: string;
}

export interface TemplateGenerationResult {
  id: string;
  image: string;

  generationType: "template";

  provider: string;
  model: string;

  status: string;

  references: TemplateGenerationReferences;

  values: Record<string, string>;

  createdAt: Date;

  plan: string;

  usage: {
    used: number;
    limit: number | null;
    remaining: number | null;
    unlimited: boolean;
  };
}