import "server-only";
import { generateText } from "ai";
import { getAIProvider, AI_MODELS, isAIConfigured } from "./provider";
import { VALIDATION_RULES } from "@/constants/video";
import type { HookTone } from "@/lib/types/thumbnails";

/**
 * Check if metadata generation is available.
 */
export function isMetadataGenerationAvailable(): boolean {
  return isAIConfigured();
}

/**
 * Get tone-specific style guidance for description generation.
 */
function getDescriptionToneGuidance(tone: HookTone): string {
  switch (tone) {
    case "viral":
      return `
- Use exciting, attention-grabbing language
- Include power words and emotional triggers
- Create urgency and FOMO (fear of missing out)
- Use short, punchy sentences mixed with longer explanations
- Include hooks and cliffhangers`;
    case "curiosity":
      return `
- Ask thought-provoking questions
- Tease interesting facts or revelations
- Create intrigue without giving everything away
- Use "discover", "learn", "find out" type language
- Build anticipation throughout`;
    case "educational":
      return `
- Be clear, informative, and professional
- Structure information logically
- Highlight key takeaways and learning points
- Use "in this video you'll learn" type framing
- Include relevant timestamps or sections when applicable`;
    default:
      return "- Be engaging and informative";
  }
}

export interface GenerateDescriptionParams {
  hookText: string;
  tone: HookTone;
  videoTitle?: string;
  // Video description: context about the video, used as fallback when hookText is empty
  videoDescription?: string;
  additionalContext?: string;
}

/**
 * Generate a YouTube video description using AI.
 * Returns a description optimized for YouTube SEO.
 */
export async function generateDescription(
  params: GenerateDescriptionParams
): Promise<string> {
  const { hookText, tone, videoTitle, videoDescription, additionalContext } = params;
  const provider = getAIProvider();
  const toneGuidance = getDescriptionToneGuidance(tone);

  // Use hookText if provided, otherwise fall back to videoDescription
  const topicText = hookText || videoDescription || "";

  const systemPrompt = `You are an expert YouTube SEO specialist and content creator. Your task is to generate engaging, optimized video descriptions that:
- Maximize viewer engagement and watch time
- Improve search discoverability
- Include relevant keywords naturally
- Follow YouTube best practices
- Are between 300-${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters

Always structure the description with:
1. A compelling opening hook (first 1-2 lines are visible in search results)
2. Main content summary
3. Key points or timestamps section (if applicable)
4. Call to action (subscribe, like, comment)
5. Relevant links section placeholder
6. Relevant hashtags (3-5 max)

Do NOT include any markdown formatting, asterisks, or special characters. Output plain text only.`;

  const userPrompt = `Generate a YouTube video description for:

${hookText ? `Hook/Topic: "${hookText}"` : !hookText && videoDescription ? `Video Topic: "${videoDescription}"` : `Topic: (Generate a compelling topic based on the tone)`}
${videoTitle ? `Video Title: "${videoTitle}"` : ""}
Tone: ${tone}
${videoDescription && hookText ? `Additional Video Context: ${videoDescription}` : ""}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Tone Guidelines:${toneGuidance}

Generate a complete, ready-to-use YouTube description. Remember: no markdown formatting, plain text only.`;

  const { text } = await generateText({
    model: provider(AI_MODELS.text),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
  });

  // Ensure we don't exceed max length
  const description = text.trim().slice(0, VALIDATION_RULES.DESCRIPTION_MAX_LENGTH);

  return description;
}

/**
 * Get tone-specific guidance for tags generation.
 */
function getTagsToneGuidance(tone: HookTone): string {
  switch (tone) {
    case "viral":
      return "Focus on trending topics, viral keywords, and high-search-volume terms";
    case "curiosity":
      return "Include question-based keywords and discovery-related terms";
    case "educational":
      return "Focus on educational keywords, how-to terms, and tutorial-related phrases";
    default:
      return "Use relevant, high-value keywords";
  }
}

export interface GenerateTagsParams {
  hookText: string;
  tone: HookTone;
  description?: string;
}

/**
 * Generate YouTube video tags using AI.
 * Returns an array of optimized tags (max 15).
 */
export async function generateTags(
  params: GenerateTagsParams
): Promise<string[]> {
  const { hookText, tone, description } = params;
  const provider = getAIProvider();
  const toneGuidance = getTagsToneGuidance(tone);

  const systemPrompt = `You are an expert YouTube SEO specialist. Your task is to generate highly relevant video tags that:
- Improve search discoverability
- Include a mix of broad and specific keywords
- Are relevant to the content
- Follow YouTube tag best practices (no single character tags, no overly generic terms)

Rules:
- Generate exactly ${VALIDATION_RULES.TAGS_MAX_COUNT} tags
- Each tag should be 2-30 characters
- Use lowercase unless it's a proper noun
- Include a mix of: main topic, related topics, long-tail keywords
- Output ONLY a comma-separated list of tags, nothing else`;

  const userPrompt = `Generate ${VALIDATION_RULES.TAGS_MAX_COUNT} YouTube tags for:

Hook/Topic: "${hookText}"
Tone: ${tone}
${description ? `Video Description Summary: ${description.slice(0, 500)}...` : ""}

Guidelines: ${toneGuidance}

Output format: tag1, tag2, tag3, ... (comma-separated, no numbering, no explanations)`;

  const { text } = await generateText({
    model: provider(AI_MODELS.text),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.6,
  });

  // Parse tags from comma-separated list
  const tags = text
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length >= 2 && tag.length <= 30)
    .slice(0, VALIDATION_RULES.TAGS_MAX_COUNT);

  return tags;
}

