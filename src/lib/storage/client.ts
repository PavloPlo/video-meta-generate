import "server-only";
import { env } from "@/lib/env.server";

/**
 * Storage client configuration.
 * Supports S3-compatible storage (AWS S3, Supabase Storage, etc.)
 *
 * Note: Install dependencies first:
 * npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

// Type definitions for when AWS SDK is installed
type S3ClientConfig = {
  region: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  forcePathStyle?: boolean;
};

/**
 * Creates and returns an S3-compatible storage client.
 * Returns null if storage is not configured.
 */
export function getStorageClient() {
  // Check if storage is configured
  if (
    !env.STORAGE_BUCKET ||
    !env.STORAGE_ACCESS_KEY_ID ||
    !env.STORAGE_SECRET_ACCESS_KEY
  ) {
    return null;
  }

  // Dynamic import to avoid errors if AWS SDK is not installed
  try {
    // Using require() for optional dependency that may not be installed
    const { S3Client } = require("@aws-sdk/client-s3");

    const config: S3ClientConfig = {
      region: env.STORAGE_REGION,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      },
    };

    if (env.STORAGE_ENDPOINT) {
      config.endpoint = env.STORAGE_ENDPOINT;
    }

    if (env.STORAGE_FORCE_PATH_STYLE) {
      config.forcePathStyle = true;
    }

    return new S3Client(config);
  } catch (error) {
    console.warn(
      "AWS SDK not installed. Install with: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner"
    );
    return null;
  }
}

export const STORAGE_BUCKET = env.STORAGE_BUCKET;

/**
 * Uploads a file buffer to storage.
 * Returns the storage key (path) where the file was stored.
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: string
): Promise<string> {
  const client = getStorageClient();
  if (!client) {
    throw new Error("Storage is not configured. Please set storage environment variables.");
  }

  // Generate storage key: uploads/{userId}/{timestamp}-{fileName}
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageKey = `uploads/${userId}/${timestamp}-${sanitizedFileName}`;

  try {
    // Using require() for optional dependency
    const { PutObjectCommand } = require("@aws-sdk/client-s3");

    await client.send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return storageKey;
  } catch (error) {
    console.error("Failed to upload file to storage:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Generates a presigned URL for accessing a file.
 */
export async function getFileUrl(storageKey: string): Promise<string> {
  const client = getStorageClient();
  if (!client) {
    throw new Error("Storage is not configured");
  }

  // If using Supabase or custom endpoint, construct URL directly
  if (env.STORAGE_ENDPOINT && env.STORAGE_FORCE_PATH_STYLE) {
    // Supabase-style URL
    const baseUrl = env.STORAGE_ENDPOINT.replace("/s3", "");
    return `${baseUrl}/object/public/${STORAGE_BUCKET}/${storageKey}`;
  }

  // For AWS S3, use presigned URL
  try {
    // Using require() for optional dependencies
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
    const { GetObjectCommand } = require("@aws-sdk/client-s3");

    const command = new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: storageKey,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    throw new Error("Failed to generate file URL");
  }
}

