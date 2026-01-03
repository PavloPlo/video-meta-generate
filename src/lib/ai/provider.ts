import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env.server";

/**
 * Get the AI provider based on environment configuration.
 * Currently supports OpenAI with optional custom base URL for OpenAI-compatible endpoints.
 */
export function getAIProvider() {
  const provider = env.AI_PROVIDER;

  switch (provider) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new Error(
          "OPENAI_API_KEY is required when using OpenAI provider"
        );
      }
      return createOpenAI({
        apiKey: env.OPENAI_API_KEY,
        // Only include baseURL if it's defined to avoid SDK errors with undefined
        ...(env.OPENAI_BASE_URL && { baseURL: env.OPENAI_BASE_URL }),
      });
    case "anthropic":
      // Anthropic support can be added later
      throw new Error("Anthropic provider is not yet implemented");
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * AI model configuration from environment.
 */
export const AI_MODELS = {
  text: env.AI_TEXT_MODEL,
  image: env.AI_IMAGE_MODEL,
} as const;

/**
 * Check if AI is properly configured.
 */
export function isAIConfigured(): boolean {
  if (env.AI_PROVIDER === "openai") {
    return Boolean(env.OPENAI_API_KEY);
  }
  return false;
}

