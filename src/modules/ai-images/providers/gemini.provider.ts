import { GoogleGenAI } from "@google/genai";

interface GenerateWithGeminiParams {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
  model: string;
}

export interface GeneratedGeminiImage {
  buffer: Buffer;
  provider: "gemini";
  model: string;
}

export async function generateWithGemini({
  imageBuffer,
  mimeType,
  prompt,
  model,
}: GenerateWithGeminiParams): Promise<GeneratedGeminiImage> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API is not configured");
  }

  if (!imageBuffer?.length) {
    throw new Error("Image is required");
  }

  if (!prompt?.trim()) {
    throw new Error("AI prompt is required");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const base64Image = imageBuffer.toString("base64");

  try {
    const interaction = await ai.interactions.create({
      model,

      input: [
        {
          type: "image",
          mime_type: mimeType,
          data: base64Image,
        },
        {
          type: "text",
          text: prompt.trim(),
        },
      ],

      response_format: {
        type: "image",
        mime_type: "image/jpeg",
        image_size: "1K",
      },
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage?.data) {
      throw new Error("Gemini did not return a generated image");
    }

    const buffer = Buffer.from(generatedImage.data, "base64");

    if (!buffer.length) {
      throw new Error("Gemini returned an empty image");
    }

    return {
      buffer,
      provider: "gemini",
      model,
    };
  } catch (error: unknown) {
    console.error("Gemini image generation error:", error);

    if (error instanceof Error) {
      throw new Error(`Gemini image generation failed: ${error.message}`);
    }

    throw new Error("Gemini image generation failed");
  }
}
