import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VALIDATION_RULES, HOOK_TONES } from "@/constants/video";

// DEV ONLY: Set to true to use real AI generation (requires OPENAI_API_KEY)
const USE_AI_GENERATION = false;

/**
 * Request validation schema for description generation.
 */
const GenerateDescriptionSchema = z.object({
  hookText: z
    .string()
    .max(
      VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH,
      `Hook text must be ${VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH} characters or less`
    )
    .default(""),
  tone: z.enum([HOOK_TONES.VIRAL, HOOK_TONES.CURIOSITY, HOOK_TONES.EDUCATIONAL]),
  videoTitle: z.string().max(VALIDATION_RULES.TITLE_MAX_LENGTH).optional(),
  // Video description: used when hookText is empty (e.g., when only images are provided)
  videoDescription: z.string().max(VALIDATION_RULES.VIDEO_CONTEXT_MAX_LENGTH).optional(),
  additionalContext: z.string().max(500).optional(),
});

type GenerateDescriptionRequest = z.infer<typeof GenerateDescriptionSchema>;

/**
 * Generate a mock description for development/testing.
 */
function generateMockDescription(hookText: string, tone: string, videoDescription?: string): string {
  const toneEmoji =
    tone === "viral" ? "🔥" : tone === "curiosity" ? "❓" : "🎓";

  // Use hookText if provided, otherwise fall back to videoDescription or a default
  const topicText = hookText || videoDescription || "Amazing content you won't want to miss!";

  return `${toneEmoji} ${topicText}

In this video, we dive deep into everything you need to know about this topic. Whether you're a beginner or an expert, you'll find valuable insights here.

📌 What You'll Learn:
• Key concept #1 explained simply
• Practical tips you can use today
• Common mistakes to avoid
• Expert strategies for success

⏱️ Timestamps:
0:00 - Introduction
1:30 - Main Topic Overview
5:00 - Deep Dive
10:00 - Practical Examples
15:00 - Summary & Next Steps

🔔 Don't forget to subscribe and hit the bell icon to never miss an update!

👍 If you found this helpful, give it a thumbs up and share with others who might benefit.

💬 Drop a comment below with your thoughts or questions!

📱 Follow us on social media:
• Twitter: @channel
• Instagram: @channel

#${tone} #tutorial #howto #tips #learning`;
}

/**
 * POST /api/metadata/description
 *
 * Generate YouTube video description based on hook text and tone.
 *
 * Request body:
 * - hookText: string (required, max 200 chars)
 * - tone: 'viral' | 'curiosity' | 'educational'
 * - videoTitle: string (optional, max 100 chars)
 * - additionalContext: string (optional, max 500 chars)
 *
 * Response:
 * - description: string (max 5000 chars)
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
    let body: GenerateDescriptionRequest;
    try {
      const rawBody = await request.json();
      body = GenerateDescriptionSchema.parse(rawBody);
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

    const { hookText, tone, videoTitle, videoDescription, additionalContext } = body;

    // 3. Generate description
    if (USE_AI_GENERATION) {
      // AI generation path (requires OPENAI_API_KEY)
      const { generateDescription, isMetadataGenerationAvailable } =
        await import("@/lib/ai/metadata");

      if (!isMetadataGenerationAvailable()) {
        return NextResponse.json(
          {
            error: {
              code: "SERVER_ERROR",
              message:
                "Description generation is not configured. Please set OPENAI_API_KEY.",
            },
          },
          { status: 503 }
        );
      }

      const description = await generateDescription({
        hookText,
        tone,
        videoTitle,
        videoDescription,
        additionalContext,
      });

      return NextResponse.json({ description });
    }

    // 4. DEV ONLY: Return mock description
    // Simulate network delay (500-1000ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500)
    );

    const mockDescription = generateMockDescription(hookText, tone, videoDescription);

    return NextResponse.json({
      description: mockDescription,
    });
  } catch (error) {
    console.error("Description generation error:", error);

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

