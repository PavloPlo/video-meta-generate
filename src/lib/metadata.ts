import { API_ENDPOINTS } from '@/constants/api';
import type { HookTone } from '@/lib/types/thumbnails';

// =============================================================================
// Types
// =============================================================================

export interface GenerateDescriptionRequest {
  hookText: string;
  tone: HookTone;
  videoTitle?: string;
  // Video description: context about the video, used when hookText is empty
  videoDescription?: string;
  additionalContext?: string;
}

export interface GenerateDescriptionResponse {
  description: string;
}

export interface GenerateTagsRequest {
  hookText: string;
  tone: HookTone;
  description?: string;
}

export interface GenerateTagsResponse {
  tags: string[];
}

interface MetadataError {
  code: string;
  message: string;
}

interface MetadataApiResponse {
  error?: MetadataError;
  description?: string;
  tags?: string[];
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Generate a YouTube video description.
 * 
 * Note: The API returns hardcoded mock responses when USE_AI_GENERATION=false
 * in the route handler. Set USE_AI_GENERATION=true in the API route when ready
 * to use real AI generation.
 * 
 * @see src/app/api/metadata/description/route.ts
 */
export async function generateDescription(
  request: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> {
  const response = await fetch(API_ENDPOINTS.METADATA_DESCRIPTION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: MetadataApiResponse = await response.json();

  if (!response.ok) {
    const error: MetadataError = data.error || {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
    throw new Error(error.message);
  }

  if (!data.description) {
    throw new Error('No description returned from server');
  }

  return { description: data.description };
}

/**
 * Generate YouTube video tags.
 * 
 * Note: The API returns hardcoded mock responses when USE_AI_GENERATION=false
 * in the route handler. Set USE_AI_GENERATION=true in the API route when ready
 * to use real AI generation.
 * 
 * @see src/app/api/metadata/tags/route.ts (TODO: implement this endpoint)
 */
export async function generateTags(
  request: GenerateTagsRequest
): Promise<GenerateTagsResponse> {
  const response = await fetch(API_ENDPOINTS.METADATA_TAGS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: MetadataApiResponse = await response.json();

  if (!response.ok) {
    const error: MetadataError = data.error || {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
    throw new Error(error.message);
  }

  if (!data.tags) {
    throw new Error('No tags returned from server');
  }

  return { tags: data.tags };
}

