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

  const cleanPrompt = prompt?.trim();

  if (!cleanPrompt) {
    throw new Error("AI prompt is required");
  }

  if (cleanPrompt.length > 1000) {
    throw new Error("AI prompt cannot exceed 1000 characters");
  }

  const formData = new FormData();
  formData.append("prompt", cleanPrompt);

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
    const contentType = response.headers.get("content-type") ?? "";
    let message = `Clipdrop request failed with status ${response.status}`;

    if (contentType.includes("application/json")) {
      const errorData = (await response.json()) as {
        error?: string;
      };

      if (errorData.error) {
        message = `Clipdrop: ${errorData.error}`;
      }
    } else {
      const errorText = await response.text();

      if (errorText) {
        message = `Clipdrop: ${errorText}`;
      }
    }

    console.error("Clipdrop API error:", {
      status: response.status,
      message,
    });

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("image/")) {
    throw new Error("Clipdrop returned an unexpected response format");
  }

  const arrayBuffer = await response.arrayBuffer();

  if (!arrayBuffer.byteLength) {
    throw new Error("Clipdrop returned an empty image");
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    provider: "clipdrop",
    model: "clipdrop-text-to-image",
  };
}