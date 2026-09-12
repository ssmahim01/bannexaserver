import { AIProvider } from "../constant.ai-image";

interface GenerateWithOpenRouterParams {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
  model: string;
}

export interface GeneratedAIImage {
  buffer: Buffer;
  provider: AIProvider;
  model: string;
}

function bufferToDataUrl(
  buffer: Buffer,
  mimeType: string,
): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function generateWithOpenRouter({
  imageBuffer,
  mimeType,
  prompt,
  model,
}: GenerateWithOpenRouterParams): Promise<GeneratedAIImage> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API is not configured");
  }

  if (!imageBuffer?.length) {
    throw new Error("Image is required");
  }

  if (!prompt?.trim()) {
    throw new Error("AI prompt is required");
  }

  const imageDataUrl = bufferToDataUrl(
    imageBuffer,
    mimeType,
  );

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/images",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",

          "HTTP-Referer":
            process.env.BANNEXA_FRONTEND_URL ||
            "http://localhost:3000",

          "X-Title": "Bannexa AI Studio",
        },

        body: JSON.stringify({
          model,

          prompt: prompt.trim(),

          input_references: [
            imageDataUrl,
          ],

          resolution: "1K",

          n: 1,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "OpenRouter API error:",
        response.status,
        result,
      );

      throw new Error(
        result?.error?.message ||
          "OpenRouter image generation failed",
      );
    }

    const base64Image =
      result?.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error(
        "OpenRouter unexpected response:",
        result,
      );

      throw new Error(
        "OpenRouter did not return a generated image",
      );
    }

    const buffer = Buffer.from(
      base64Image,
      "base64",
    );

    if (!buffer.length) {
      throw new Error(
        "Generated image data is empty",
      );
    }

    return {
      buffer,
      provider: "openrouter",
      model,
    };
  } catch (error: unknown) {
    console.error(
      "OpenRouter image generation error:",
      error,
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "OpenRouter image generation failed",
    );
  }
}