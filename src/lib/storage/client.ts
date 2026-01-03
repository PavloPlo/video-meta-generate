import "server-only";
import { env } from "@/lib/env.server";
import { S3Client, PutObjectCommand, GetObjectCommand, type S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  await client.send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return storageKey;
}

/**
 * Generates a presigned URL for accessing a file.
 */
export async function getFileUrl(storageKey: string): Promise<string> {
  const client = getStorageClient();
  if (!client) {
    throw new Error("Storage is not configured");
  }

  // Check if using Supabase (has /s3 in endpoint)
  const isSupabase = env.STORAGE_ENDPOINT?.includes("/s3");

  if (isSupabase && env.STORAGE_ENDPOINT) {
    // Supabase-style URL
    const baseUrl = env.STORAGE_ENDPOINT.replace("/s3", "");
    return `${baseUrl}/object/public/${STORAGE_BUCKET}/${storageKey}`;
  }

  // For AWS S3 and MinIO, use presigned URL
  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: storageKey,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
}

