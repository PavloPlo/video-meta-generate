import { API_ENDPOINTS } from '@/constants/api';
import type {
  GenerateThumbnailsRequest,
  GenerateThumbnailsResponse,
  ThumbnailApiResponse,
  ThumbnailError,
} from '@/lib/types/thumbnails';

export async function generateThumbnails(
  request: GenerateThumbnailsRequest
): Promise<GenerateThumbnailsResponse> {
  const response = await fetch(API_ENDPOINTS.THUMBNAILS_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: ThumbnailApiResponse = await response.json();

  if (!response.ok) {
    const error: ThumbnailError = data.error || {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
    throw new Error(error.message);
  }

  if (!data.variants) {
    throw new Error('No variants returned from server');
  }

  return { variants: data.variants };
}

export async function regenerateThumbnails(
  request: GenerateThumbnailsRequest
): Promise<GenerateThumbnailsResponse> {
  const response = await fetch(API_ENDPOINTS.THUMBNAILS_REGENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: ThumbnailApiResponse = await response.json();

  if (!response.ok) {
    const error: ThumbnailError = data.error || {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
    throw new Error(error.message);
  }

  if (!data.variants) {
    throw new Error('No variants returned from server');
  }

  return { variants: data.variants };
}
