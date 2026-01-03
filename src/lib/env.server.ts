import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  // Required everywhere (Option A) - provide defaults for build time
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgresql://dummy:dummy@localhost:5432/dummy"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required").default("postgresql://dummy:dummy@localhost:5432/dummy"),

  // Optional with defaults
  SESSION_COOKIE_NAME: z.string().min(1).default("sid"),
  SESSION_TTL_DAYS: z.coerce
    .number()
    .int("SESSION_TTL_DAYS must be an integer")
    .min(1, "SESSION_TTL_DAYS must be >= 1")
    .max(365, "SESSION_TTL_DAYS must be <= 365")
    .default(14),

  // Storage (optional - for file uploads)
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_REGION: z.string().min(1).default("us-east-1"),
  STORAGE_BUCKET: z.string().min(1).optional(),
  STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  STORAGE_FORCE_PATH_STYLE: z
    .string()
    .transform((val) => val === "true")
    .default(false),

  // AI Provider Configuration
  AI_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
  AI_TEXT_MODEL: z.string().min(1).default("gpt-4o"),
  AI_IMAGE_MODEL: z.string().min(1).default("dall-e-3"),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

function formatZodError(err: z.ZodError): string {
  const lines = err.issues.map((i) => {
    const path = i.path.join(".") || "(root)";
    return `- ${path}: ${i.message}`;
  });
  return lines.join("\n");
}

/**
 * Server-only typed environment variables.
 * Import from server modules only.
 */
export const env = (() => {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    // During Docker build time, allow dummy values
    const isDockerBuild = process.env.DOCKER_BUILD === "1";
    const isTestEnv = process.env.NODE_ENV === "test";

    if (isDockerBuild || isTestEnv) {
      // Use defaults for build/test time
      return EnvSchema.parse({});
    }

    // Throwing here fails fast during server startup / first import.
    throw new Error(
      `Invalid environment configuration (ensure DATABASE_URL and DIRECT_URL are set):\n${formatZodError(
        parsed.error
      )}\n`
    );
  }
  return parsed.data;
})();
