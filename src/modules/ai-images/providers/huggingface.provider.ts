import {
  InferenceClient,
  type InferenceProvider,
} from "@huggingface/inference";

const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_IMAGE_MODEL ||
  "Qwen/Qwen-Image-Edit";

const HUGGINGFACE_PROVIDER: InferenceProvider =
  (process.env.HUGGINGFACE_PROVIDER as InferenceProvider) ||
  "fal-ai";

interface GenerateWithHuggingFaceParams {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
}

export async function generateWithHuggingFace({
  imageBuffer,
  mimeType,
  prompt,
}: GenerateWithHuggingFaceParams): Promise<{
  buffer: Buffer;
  provider: "huggingface";
  model: string;
}> {
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    console.error(
      "HF_TOKEN is missing from environment variables",
    );

    throw new Error(
      "Hugging Face API is not configured",
    );
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("Image is required");
  }

  if (!prompt?.trim()) {
    throw new Error("AI prompt is required");
  }

  const client = new InferenceClient(hfToken);

  try {
    const imageBlob = new Blob(
      [new Uint8Array(imageBuffer)],
      {
        type: mimeType,
      },
    );

    console.log("Hugging Face request:", {
      provider: HUGGINGFACE_PROVIDER,
      model: HUGGINGFACE_MODEL,
      mimeType,
      imageSize: imageBuffer.length,
    });

    const result = await client.imageToImage({
      provider: HUGGINGFACE_PROVIDER,
      model: HUGGINGFACE_MODEL,
      inputs: imageBlob,
      parameters: {
        prompt: prompt.trim(),
      },
    });

    const arrayBuffer = await result.arrayBuffer();

    if (!arrayBuffer.byteLength) {
      throw new Error(
        "Hugging Face did not return a generated image",
      );
    }

    return {
      buffer: Buffer.from(arrayBuffer),
      provider: "huggingface",
      model: HUGGINGFACE_MODEL,
    };
  } catch (error: unknown) {
    console.error(
      "Hugging Face image generation error:",
      error,
    );

    if (error instanceof Error) {
      throw new Error(
        `Hugging Face image generation failed: ${error.message}`,
      );
    }

    throw new Error(
      "Hugging Face image generation failed",
    );
  }
}