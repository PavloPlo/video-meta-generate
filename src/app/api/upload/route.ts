import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth.server";
import { validateFile } from "@/lib/fileValidation.server";
import { uploadFile, getFileUrl } from "@/lib/storage/client";
import { UPLOAD_ERROR_MESSAGES } from "@/constants/video";

/**
 * POST /api/upload
 * Upload video files or images to the server for processing
 *
 * Request: multipart/form-data
 * - file: File (video or image)
 * - type: 'video' | 'images' (optional, inferred from file type)
 *
 * Response:
 * {
 *   assetId: string;
 *   fileName: string;
 *   fileSize: number;
 *   fileType: string;
 *   duration?: number;
 *   thumbnailUrl?: string;
 *   metadata?: { width?: number; height?: number; };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate file
    const fileSize = file.size;
    const mimeType = file.type || "application/octet-stream";
    const fileName = file.name;

    // Basic validation
    const validationResult = validateFile(
      mimeType,
      fileName,
      fileSize,
      undefined // Duration will be extracted if needed (requires video processing library)
    );

    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error || "Validation failed" },
        { status: 400 }
      );
    }

    // Check file size for HTTP 413
    const isVideo = mimeType.startsWith("video/");
    const maxSizeMB = isVideo ? 500 : 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (fileSize > maxSizeBytes) {
      return NextResponse.json(
        {
          error: UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE(
            maxSizeMB,
            isVideo ? "video" : "image"
          ),
        },
        { status: 413 }
      );
    }

    // 4. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to storage
    let storageKey: string;
    try {
      storageKey = await uploadFile(buffer, fileName, mimeType, user.id);
    } catch (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to upload file to storage",
        },
        { status: 500 }
      );
    }

    // 6. Generate file URL (for immediate access)
    let publicUrl: string | undefined;
    try {
      publicUrl = await getFileUrl(storageKey);
    } catch (error) {
      console.warn("Failed to generate file URL:", error);
      // Continue without URL - it can be generated later
    }

    // 7. Extract metadata
    // Note: Video metadata extraction (duration, dimensions) requires a video processing library
    // like ffmpeg or fluent-ffmpeg. For now, we return basic info.
    // TODO: Add video metadata extraction when video processing is set up
    const metadata: {
      width?: number;
      height?: number;
    } = {};

    // For images, we could extract dimensions using sharp or similar
    // For videos, we need ffmpeg or similar
    // This is left as a TODO for now

    // 8. Generate asset ID (UUID)
    // TODO: Store in database when Asset model is added to Prisma schema
    const assetId = crypto.randomUUID();

    // 9. Return response
    const response: {
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
    } = {
      assetId,
      fileName,
      fileSize,
      fileType: mimeType,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Add duration for videos (when video processing is available)
    // if (isVideo && duration) {
    //   response.duration = duration;
    // }

    // Add thumbnail URL if available
    if (publicUrl) {
      response.thumbnailUrl = publicUrl;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle unexpected errors
    console.error("Upload endpoint error:", error);

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("Storage is not configured")) {
        return NextResponse.json(
          { error: "File storage is not configured" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

