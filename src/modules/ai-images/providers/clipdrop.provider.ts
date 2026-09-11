export interface ClipdropGenerateParams {
  prompt: string;
}

export async function generateWithClipdrop({
  prompt,
}: ClipdropGenerateParams): Promise<{
  buffer: Buffer;
  provider: "clipdrop";
  model: string;
}> {
  const apiKey = process.env.CLIPDROP_API_KEY;

  if (!apiKey) {
    throw new Error("Clipdrop API is not configured");
  }

  if (!prompt?.trim()) {
    throw new Error("AI prompt is required");
  }

  const formData = new FormData();

  formData.append("prompt", prompt.trim());

  console.log("Sending prompt to Clipdrop:", prompt);

  const response = await fetch(
    "https://clipdrop-api.co/text-to-image/v1",
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Clipdrop API error:", {
      status: response.status,
      body: errorText,
    });

    throw new Error(
      `Clipdrop image generation failed: ${errorText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (!arrayBuffer.byteLength) {
    throw new Error(
      "Clipdrop did not return a generated image",
    );
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    provider: "clipdrop",
    model: "clipdrop-text-to-image",
  };
}