const MAX_PROMPT_LENGTH = 1000;

interface BuildTemplatePromptParams {
  category: string;
  event: string;
  template: string;
  values: Record<string, string>;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function buildTemplatePrompt({
  category,
  event,
  template,
  values,
}: BuildTemplatePromptParams): string {
  const selectedOptions = Object.entries(values)
    .map(([key, value]) => {
      const cleanedValue = clean(value);

      if (!cleanedValue) {
        return null;
      }

      return `${key}: ${cleanedValue}`;
    })
    .filter((value): value is string => Boolean(value))
    .join("\n");

  const prompt = `
Create a professional, premium-quality social media graphic.

CATEGORY:
${clean(category)}

EVENT:
${clean(event)}

TEMPLATE:
${clean(template)}

CUSTOMIZATION:
${selectedOptions || "No additional customization provided."}

DESIGN REQUIREMENTS:
- Follow the selected category, event, and template style.
- Create a polished commercial-quality composition.
- Use strong visual hierarchy.
- Use premium typography and professional layout.
- Keep important text readable and properly positioned.
- Respect selected colors, language, teams, people, and messages.
- Make the design culturally and contextually appropriate.
- Create a visually striking social-media-ready design.
- Maintain balanced spacing and composition.
- Do not add random logos.
- Do not add watermarks.
- Do not add unrelated text.
- Do not add unnecessary borders or UI elements.
`.trim();

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(
      "The selected customization creates a prompt that is too long. Please use shorter text.",
    );
  }

  return prompt;
}
