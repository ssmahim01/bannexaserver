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
  "90s-nostalgia": `
Transform the uploaded photo into an authentic 1990s-inspired portrait.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same facial structure, facial proportions, eyes, nose,
lips, jawline, skin tone, age and recognizable appearance.

Do not replace the person or create a different face.

Apply an unmistakable 1990s aesthetic:
retro fashion, period-appropriate hairstyle, nostalgic styling,
analog photography, soft flash, subtle film grain, slightly faded
colors and authentic 90s atmosphere.

Keep the result photorealistic and naturally recognizable.
`,

  "durga-puja": `
Transform the uploaded photo into a beautiful cinematic Durga Puja
festival portrait inspired by Bengali festive culture.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same face, facial proportions, skin tone, age and
recognizable appearance.

Do not replace the person with another person.

Create an authentic festive atmosphere with elegant traditional
Bengali styling, warm festive lighting, beautiful Durga Puja
decorations, pandal-inspired surroundings and subtle cultural details.

Use refined traditional aesthetics without making the scene
artificial or overcrowded.

Keep the result photorealistic, premium and cinematic.
`,

  "old-money": `
Transform the uploaded portrait into a sophisticated old-money
editorial portrait.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same facial structure, facial proportions, skin tone,
age and recognizable appearance.

Do not replace or redesign the face.

Apply timeless luxury styling:
refined classic clothing, elegant surroundings, subtle luxury,
natural window lighting, sophisticated composition and premium
editorial photography.

Avoid excessive logos, flashy branding or unrealistic luxury props.

Keep the result photorealistic and understated.
`,

  "vintage-film": `
Transform the uploaded photo into a timeless vintage film photograph.

IMPORTANT:
Preserve the exact identity and recognizable facial features
of the person.

Do not replace the person or redesign the face.

Apply authentic analog photography characteristics:
natural film grain, soft contrast, subtle faded colors,
slight imperfections, vintage lens characteristics and
classic photographic atmosphere.

Make it feel like a genuine photograph captured on film,
not a modern digital filter.

Keep the person realistic and recognizable.
`,

  "street-style": `
Transform the uploaded portrait into a premium urban street-style
fashion photograph.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same facial structure, proportions, skin tone and
recognizable appearance.

Do not replace the person.

Create a stylish urban environment with contemporary fashion,
city architecture, natural street lighting, editorial composition
and confident street-photography aesthetics.

Keep clothing and styling realistic and tasteful.

Maintain photorealistic facial details.
`,

  "royal-portrait": `
Transform the uploaded portrait into a majestic royal-inspired
portrait.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same facial structure, facial proportions, eyes, nose,
lips, jawline, skin tone, age and recognizable appearance.

Do not replace the person with another person.

Create an elegant regal atmosphere using sophisticated traditional
or ceremonial clothing, refined architecture, dramatic lighting,
rich textures and premium portrait composition.

The result should feel luxurious and majestic without becoming
fantasy-like or artificial.

Keep it photorealistic.
`,

  cyberpunk: `
Transform the uploaded portrait into a cinematic cyberpunk portrait.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same facial structure, facial proportions, eyes, nose,
lips, jawline, skin tone and recognizable appearance.

Do not replace the person.

Create a futuristic urban environment with neon illumination,
rain-reflective streets, futuristic architecture, atmospheric
lighting and sophisticated cyberpunk styling.

Use cinematic depth and realistic environmental details.

Keep the face highly realistic and recognizable.
`,

  "monsoon-mood": `
Transform the uploaded photo into a cinematic monsoon portrait.

IMPORTANT:
Preserve the exact identity of the person.
Keep the same face, facial proportions, skin tone, age and
recognizable appearance.

Do not replace the person.

Create a beautiful rainy atmosphere with soft overcast lighting,
natural rain, wet surroundings, reflections, atmospheric depth
and emotional cinematic composition.

The scene should feel authentic and photographic rather than
artificial or overly dramatic.

Maintain realistic skin texture and facial details.
`,
};
