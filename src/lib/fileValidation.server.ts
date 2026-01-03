import "server-only";
import {
  UPLOAD_CONSTRAINTS,
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  UPLOAD_ERROR_MESSAGES,
} from "@/constants/video";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

/**
 * Validates if the file format is supported (server-side)
 */
export function validateFileFormat(
  mimeType: string,
  fileName: string
): ValidationResult {
  const isVideo = mimeType.startsWith("video/");
  const isImage = mimeType.startsWith("image/");

  if (!isVideo && !isImage) {
    return {
      isValid: false,
      error: "File must be a video or image",
    };
  }

  if (isVideo && !SUPPORTED_VIDEO_FORMATS.includes(mimeType as never)) {
    return {
      isValid: false,
      error: UPLOAD_ERROR_MESSAGES.UNSUPPORTED_FORMAT("video"),
    };
  }

  if (isImage && !SUPPORTED_IMAGE_FORMATS.includes(mimeType as never)) {
    return {
      isValid: false,
      error: UPLOAD_ERROR_MESSAGES.UNSUPPORTED_FORMAT("image"),
    };
  }

  return { isValid: true };
}

/**
 * Validates file size against constraints (server-side)
 */
export function validateFileSize(
  fileSize: number,
  isVideo: boolean
): ValidationResult {
  const maxSizeMB = isVideo
    ? UPLOAD_CONSTRAINTS.VIDEO_MAX_SIZE_MB
    : UPLOAD_CONSTRAINTS.IMAGE_MAX_SIZE_MB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE(
        maxSizeMB,
        isVideo ? "video" : "image"
      ),
    };
  }

  return { isValid: true };
}

/**
 * Validates video duration (server-side)
 * Note: Actual duration extraction requires video processing library
 * This validates against the max duration constraint
 */
export function validateVideoDuration(duration?: number): ValidationResult {
  if (duration === undefined) {
    // Duration validation will be done during metadata extraction
    return { isValid: true };
  }

  if (duration > UPLOAD_CONSTRAINTS.VIDEO_MAX_DURATION_SECONDS) {
    return {
      isValid: false,
      error: UPLOAD_ERROR_MESSAGES.VIDEO_TOO_LONG(
        UPLOAD_CONSTRAINTS.VIDEO_MAX_DURATION_SECONDS
      ),
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive file validation (server-side)
 */
export function validateFile(
  mimeType: string,
  fileName: string,
  fileSize: number,
  duration?: number
): ValidationResult {
  const isVideo = mimeType.startsWith("video/");

  // Check format
  const formatResult = validateFileFormat(mimeType, fileName);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Check size
  const sizeResult = validateFileSize(fileSize, isVideo);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  // Check video duration if applicable
  if (isVideo) {
    const durationResult = validateVideoDuration(duration);
    if (!durationResult.isValid) {
      return durationResult;
    }
  }

  return { isValid: true };
}

