import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VALIDATION_RULES, HOOK_TONES } from "@/constants/video";

// DEV ONLY: Set to true to use real AI generation (requires OPENAI_API_KEY)
const USE_AI_GENERATION = false;

/**
 * Request validation schema for tags generation.
 */
const GenerateTagsSchema = z.object({
  hookText: z
    .string()
    .max(
      VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH,
      `Hook text must be ${VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH} characters or less`
    )
    .default(""),
  tone: z.enum([HOOK_TONES.VIRAL, HOOK_TONES.CURIOSITY, HOOK_TONES.EDUCATIONAL]),
  description: z.string().max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH).optional(),
});

type GenerateTagsRequest = z.infer<typeof GenerateTagsSchema>;

/**
 * Generate mock tags for development/testing.
 */
function generateMockTags(tone: string): string[] {
  const baseTags = ["tutorial", "guide", "howto", "tips", "education"];
  const toneTags: Record<string, string[]> = {
    viral: ["viral", "trending", "mustwatch", "gamechanger", "lifechanging"],
    curiosity: ["interesting", "discovery", "mystery", "explained", "revealed"],
    educational: ["learn", "study", "knowledge", "skills", "masterclass"],
  };

  return [...baseTags, ...(toneTags[tone] || []), "2024", "new", "best"];
}

/**
 * POST /api/metadata/tags
 *
 * Generate YouTube video tags based on hook text and tone.
 *
 * Request body:
 * - hookText: string (optional, max 200 chars)
 * - tone: 'viral' | 'curiosity' | 'educational'
 * - description: string (optional, max 5000 chars)
 *
 * Response:
 * - tags: string[] (max 15 tags)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    // DEV ONLY: Authentication check disabled for development
    // const user = await getCurrentUser();
    // if (!user) {
    //   return NextResponse.json(
    //     { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
    //     { status: 401 }
    //   );
    // }
    // DEV ONLY: Use seeded test user (run `npm run db:seed` first)
    const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
    void DEV_USER_ID; // Mark as intentionally unused for now

    // 2. Parse and validate request body
    let body: GenerateTagsRequest;
    try {
      const rawBody = await request.json();
      body = GenerateTagsSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.issues,
            },
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 }
      );
    }

    const { tone } = body;

    // 3. Generate tags
    if (USE_AI_GENERATION) {
      // AI generation path (requires OPENAI_API_KEY)
      const { generateTags, isMetadataGenerationAvailable } = await import(
        "@/lib/ai/metadata"
      );

      if (!isMetadataGenerationAvailable()) {
        return NextResponse.json(
          {
            error: {
              code: "SERVER_ERROR",
              message:
                "Tags generation is not configured. Please set OPENAI_API_KEY.",
            },
          },
          { status: 503 }
        );
      }

      const tags = await generateTags({
        hookText: body.hookText,
        tone,
        description: body.description,
      });

      return NextResponse.json({ tags });
    }

    // 4. DEV ONLY: Return mock tags
    // Simulate network delay (300-600ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 300)
    );

    const mockTags = generateMockTags(tone);

    return NextResponse.json({
      tags: mockTags,
    });
  } catch (error) {
    console.error("Tags generation error:", error);

    // Handle rate limiting from OpenAI
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        { status: 429 }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes("OpenAI")) {
      return NextResponse.json(
        {
          error: {
            code: "SERVER_ERROR",
            message: "AI service error. Please try again later.",
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

