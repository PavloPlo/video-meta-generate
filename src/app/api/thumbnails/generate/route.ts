import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VALIDATION_RULES, HOOK_TONES, THUMBNAIL_SOURCE_TYPES } from "@/constants/video";
import type { Readability } from "@/lib/types/thumbnails";

// DEV ONLY: Set to true to use real AI generation (requires OPENAI_API_KEY)
const USE_AI_GENERATION = false;

const MOCK_READABILITY: Readability[] = ["good", "good", "ok", "good", "ok", "poor"];

/**
 * Request validation schema for thumbnail generation.
 */
const GenerateThumbnailsSchema = z.object({
  hookText: z
    .string()
    .max(
      VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH,
      `Hook text must be ${VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH} characters or less`
    )
    .default(""),
  tone: z.enum([HOOK_TONES.VIRAL, HOOK_TONES.CURIOSITY, HOOK_TONES.EDUCATIONAL]),
  source: z.object({
    type: z.enum([THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES, THUMBNAIL_SOURCE_TYPES.IMAGES]),
    assetIds: z.array(z.string()).min(0), // Can be empty for AI-only generation
  }),
  count: z
    .number()
    .int()
    .min(1)
    .max(VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX)
    .default(VALIDATION_RULES.THUMBNAIL_VARIANTS_INITIAL),
});

type GenerateThumbnailsRequest = z.infer<typeof GenerateThumbnailsSchema>;

/**
 * Generate mock thumbnail variants for development/testing.
 */
function generateMockThumbnails(count: number, tone: string) {
  // Add some delay to simulate API call
  const variants = [];
  
  for (let i = 0; i < count; i++) {
    // Use tone-specific seeds for variety
    const seed = `${tone}-${Date.now()}-${i}`;
    variants.push({
      id: `thumb_${Date.now()}_${i}`,
      imageUrl: `https://picsum.photos/seed/${seed}/1280/720`,
      readability: MOCK_READABILITY[i % MOCK_READABILITY.length],
    });
  }
  
  return variants;
}

/**
 * POST /api/thumbnails/generate
 *
 * Generate initial thumbnail variants from uploaded assets or AI.
 *
 * Request body:
 * - hookText: string (max 200 chars, optional)
 * - tone: 'viral' | 'curiosity' | 'educational'
 * - source: { type: 'videoFrames' | 'images', assetIds: string[] }
 * - count: number (1-6, default 3)
 *
 * Response:
 * - variants: Array<{ id: string, imageUrl: string, readability?: 'good' | 'ok' | 'poor' }>
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
    const user = { id: DEV_USER_ID };

    // 2. Parse and validate request body
    let body: GenerateThumbnailsRequest;
    try {
      const rawBody = await request.json();
      body = GenerateThumbnailsSchema.parse(rawBody);
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

    const { tone, count } = body;

    // 3. Generate thumbnails
    if (USE_AI_GENERATION) {
      // AI generation path (requires OPENAI_API_KEY)
      // Import dynamically to avoid errors when AI is not configured
      const { generateThumbnailImages, isThumbnailGenerationAvailable } = await import(
        "@/lib/ai/thumbnails"
      );
      const { prisma } = await import("@/lib/db/prisma");

      if (!isThumbnailGenerationAvailable()) {
        return NextResponse.json(
          {
            error: {
              code: "SERVER_ERROR",
              message: "Thumbnail generation is not configured. Please set OPENAI_API_KEY.",
            },
          },
          { status: 503 }
        );
      }

      const thumbnails = await generateThumbnailImages({
        hookText: body.hookText,
        tone,
        count,
      });

      // Save to database
      const savedThumbnails = await Promise.all(
        thumbnails.map(async (thumb) => {
          const saved = await prisma.generatedThumbnail.create({
            data: {
              userId: user.id,
              assetId: body.source.assetIds[0] || null,
              imageUrl: thumb.imageUrl,
              hookText: body.hookText,
              tone,
            },
            select: {
              id: true,
              imageUrl: true,
            },
          });

          return {
            id: saved.id,
            imageUrl: saved.imageUrl,
            readability: thumb.readability,
          };
        })
      );

      return NextResponse.json({ variants: savedThumbnails });
    }

    // 4. DEV ONLY: Return mock thumbnails
    // Simulate network delay (300-800ms)
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

    const mockVariants = generateMockThumbnails(count, tone);

    return NextResponse.json({
      variants: mockVariants,
    });
  } catch (error) {
    console.error("Thumbnail generation error:", error);

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

