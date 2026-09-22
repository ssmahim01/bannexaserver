import { IGeneratorTemplate } from "./model.generator-template";

interface BuildPromptParams {
  template: IGeneratorTemplate;
  values: Record<string, unknown>;
}

export function buildTemplatePrompt({
  template,
  values,
}: BuildPromptParams): string {
  let prompt = template.promptTemplate;

  for (const field of template.fields) {
    const value = values[field.key];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    const stringValue = String(value).trim();

    prompt = prompt.replace(
      new RegExp(`{{\\s*${field.key}\\s*}}`, "g"),
      stringValue,
    );
  }

  const additionalContext = Object.entries(values)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== "",
    )
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
    .join("\n");

  return `
${prompt}

USER SELECTED OPTIONS:
${additionalContext}

QUALITY REQUIREMENTS:
- Professional commercial design
- Strong visual hierarchy
- Balanced composition
- High-quality visual details
- Suitable for social media
- Premium creative appearance
- Clean and visually coherent composition
- No watermark
- No random logos
`.trim();
}