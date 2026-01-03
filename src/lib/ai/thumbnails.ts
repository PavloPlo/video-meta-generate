import "server-only";
import OpenAI from "openai";
import { env } from "@/lib/env.server";
import type { HookTone, Readability } from "@/lib/types/thumbnails";

/**
 * Get the OpenAI client for image generation.
 * We use the OpenAI SDK directly for DALL-E as the Vercel AI SDK
 * doesn't have full image generation support.
 */
function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for thumbnail generation");
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    // Only include baseURL if it's defined to avoid SDK errors with undefined
    ...(env.OPENAI_BASE_URL && { baseURL: env.OPENAI_BASE_URL }),
  });
}

/**
 * Get tone-specific style modifiers for the prompt.
 */
function getToneStyle(tone: HookTone): string {
  switch (tone) {
    case "viral":
      return "Bold, high-contrast, attention-grabbing, dramatic lighting, vibrant colors, eye-catching composition";
    case "curiosity":
      return "Intriguing, mysterious, thought-provoking, subtle visual questions, engaging imagery that sparks interest";
    case "educational":
      return "Clean, professional, informative, clear visual hierarchy, trustworthy, organized composition";
    default:
      return "Professional, clean, engaging";
  }
}

/**
 * Build a prompt for thumbnail generation.
 */
function buildThumbnailPrompt(hookText: string, tone: HookTone): string {
  const toneStyle = getToneStyle(tone);

  return `Create a YouTube video thumbnail with the following characteristics:

Topic/Hook: "${hookText}"

Style Requirements:
- ${toneStyle}
- YouTube thumbnail optimized (16:9 aspect ratio feel)
- High visual impact and clarity
- Professional quality
- Leave space for text overlay if needed
- No text in the image itself (text will be added separately)
- Eye-catching focal point
- Suitable for YouTube audience

The image should visually represent the topic while being instantly recognizable and compelling at small sizes.`;
}

export interface GeneratedThumbnail {
  id: string;
  imageUrl: string;
  readability: Readability;
}

export interface GenerateThumbnailsParams {
  hookText: string;
  tone: HookTone;
  count: number;
}

/**
 * Generate thumbnail images using DALL-E 3.
 * Returns an array of generated thumbnail variants.
 */
export async function generateThumbnailImages(
  params: GenerateThumbnailsParams
): Promise<GeneratedThumbnail[]> {
  const { hookText, tone, count } = params;
  const client = getOpenAIClient();
  const prompt = buildThumbnailPrompt(hookText, tone);

  // DALL-E 3 only supports n=1, so we need to make multiple requests
  const generateSingle = async (index: number): Promise<GeneratedThumbnail> => {
    const response = await client.images.generate({
      model: env.AI_IMAGE_MODEL,
      prompt,
      n: 1,
      size: "1792x1024", // Close to 16:9 ratio for YouTube thumbnails
      quality: "standard",
      style: tone === "viral" ? "vivid" : "natural",
    });

    const imageUrl = (response as any).data?.[0]?.url;
    if (!imageUrl) {
      console.error('OpenAI response:', response);
      throw new Error(`Failed to generate thumbnail ${index + 1}: No image URL in response`);
    }

    return {
      id: `thumb_${Date.now()}_${index}`,
      imageUrl,
      // Default to 'good' - actual readability analysis could be done separately
      readability: "good" as Readability,
    };
  };

  // Generate thumbnails in parallel (limited by count)
  const thumbnailPromises = Array.from({ length: count }, (_, i) =>
    generateSingle(i)
  );

  const results = await Promise.allSettled(thumbnailPromises);

  // Filter successful results and throw if all failed
  const successfulThumbnails: GeneratedThumbnail[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      successfulThumbnails.push(result.value);
    } else {
      errors.push(result.reason?.message || "Unknown error");
    }
  }

  if (successfulThumbnails.length === 0) {
    throw new Error(
      `Failed to generate any thumbnails: ${errors.join(", ")}`
    );
  }

  return successfulThumbnails;
}

/**
 * Check if thumbnail generation is available.
 */
export function isThumbnailGenerationAvailable(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

