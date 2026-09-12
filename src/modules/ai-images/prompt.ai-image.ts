import { AIImageCategory } from "./constant.ai-image";

export const AI_PROMPTS: Record<AIImageCategory, string> = {
  "actor-vibe": `
Transform the uploaded portrait into a premium cinematic actor-style portrait.

IMPORTANT:
Preserve the identity of the person in the uploaded image.
Keep the same facial identity, facial structure, facial proportions,
eyes, eyebrows, nose, lips, jawline, skin tone, hairstyle characteristics,
age and recognizable appearance.

Do not replace the person.
Do not create a different person's face.
Do not change the person's identity.

Only transform the visual presentation:
cinematic lighting, sophisticated styling, professional wardrobe,
dramatic atmosphere, premium background and cinematic color grading.

Keep the result photorealistic with natural skin texture
and realistic facial details.
`,

  enhance: `
Professionally enhance the uploaded photograph.

IMPORTANT:
Preserve the exact person and recognizable facial identity.
Keep the same facial structure, eyes, nose, lips, jawline,
skin tone and natural appearance.

Do not replace or redesign the face.

Improve:
- lighting
- sharpness
- clarity
- dynamic range
- skin detail
- color balance
- photographic quality

Keep the image natural and photorealistic.
`,

  cinematic: `
Transform the uploaded portrait into a premium cinematic photograph.

IMPORTANT:
Preserve the exact identity of the person in the uploaded image.
Keep the same face, facial proportions, eyes, nose, lips,
jawline, skin tone and recognizable appearance.

Do not replace the person with another person.

Change primarily:
- cinematic lighting
- atmosphere
- depth
- color grading
- background
- photographic mood

Maintain realistic skin texture and photorealistic facial details.
`,

  professional: `
Transform the uploaded portrait into a premium professional studio portrait.

IMPORTANT:
Preserve the exact identity and facial characteristics
of the person in the uploaded image.

Do not replace the person.
Do not redesign the face.

Use:
- professional studio lighting
- clean background
- natural skin tones
- polished composition
- realistic photographic details

The result should look like a professional studio photograph
of the same person.
`,

  anime: `
Transform the uploaded portrait into a high-quality anime-inspired
artistic portrait.

IMPORTANT:
Preserve the recognizable identity, facial proportions,
pose and major facial characteristics of the person.

Do not replace the person with an unrelated character.

Apply an anime-inspired artistic style while keeping
the person recognizable and maintaining the original composition.
`,
};
