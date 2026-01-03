import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

/**
 * GA4 Measurement Protocol event schema
 * Based on: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */
const GA4EventSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  events: z.array(z.object({
    name: z.string().min(1).max(40, 'Event name too long'),
    params: z.record(z.string(), z.unknown()).optional(),
  })).min(1, 'At least one event required'),
  userId: z.string().optional(),
});

type GA4EventRequest = z.infer<typeof GA4EventSchema>;

/**
 * POST /api/synch
 *
 * Forwards analytics events to Google Analytics 4 via Measurement Protocol.
 * Used when client-side gtag might be blocked by ad blockers.
 *
 * Request body:
 * - clientId: string (required)
 * - events: Array<{ name: string, params?: Record<string, unknown> }> (required)
 * - userId?: string (optional)
 *
 * Response:
 * - success: boolean
 * - skipped?: boolean (when GA not configured)
 */
export async function POST(request: NextRequest) {
  try {
    // Skip if GA4 not configured - don't fail, just skip
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[GA4] Skipped - GA_MEASUREMENT_ID or GA_API_SECRET not configured');
      }
      return NextResponse.json({ success: true, skipped: true });
    }

    // Parse and validate request body
    let body: GA4EventRequest;
    try {
      const rawBody = await request.json();
      body = GA4EventSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[GA4] Validation error:', error.issues);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: error.issues
          },
          { status: 400 }
        );
      }
      console.error('[GA4] JSON parsing error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    // Forward to GA4 Measurement Protocol
    try {
      const response = await fetch(
        `${GA_ENDPOINT}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: body.clientId,
            user_id: body.userId,
            events: body.events,
          }),
        }
      );

      if (!response.ok) {
        console.error(`[GA4] Measurement Protocol error: ${response.status} ${response.statusText}`);
        // Don't fail the request - analytics should never break functionality
      } else if (process.env.NODE_ENV === 'development') {
        console.debug('[GA4] Events forwarded successfully');
      }

      return NextResponse.json({ success: true });
    } catch (fetchError) {
      console.error('[GA4] Network error forwarding to Measurement Protocol:', fetchError);
      // Don't fail the request - analytics should never break functionality
      return NextResponse.json({ success: false }, { status: 200 });
    }
  } catch (error) {
    // Log unexpected errors but don't fail the request
    console.error('[GA4] Unexpected error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
