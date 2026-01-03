import { API_ENDPOINTS } from '@/constants/api';

export interface UploadFileResponse {
  assetId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
  };
}

export interface UploadFileError {
  error: string;
  status?: number;
}

/**
 * Uploads a file to the server using the /api/upload endpoint
 * @param file - The file to upload
 * @returns Promise resolving to upload response with asset ID and metadata
 * @throws Error if upload fails
 */
export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(API_ENDPOINTS.UPLOAD, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    const error: UploadFileError = {
      error: errorData.error || `Upload failed with status ${response.status}`,
      status: response.status,
    };
    throw new Error(error.error);
  }

  const data = await response.json();
  return data;
}

