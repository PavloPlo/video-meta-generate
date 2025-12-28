import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  // Required everywhere (Option A)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  // Optional with defaults
  SESSION_COOKIE_NAME: z.string().min(1).default("sid"),
  SESSION_TTL_DAYS: z.coerce
    .number()
    .int("SESSION_TTL_DAYS must be an integer")
    .min(1, "SESSION_TTL_DAYS must be >= 1")
    .max(365, "SESSION_TTL_DAYS must be <= 365")
    .default(14),

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
    // Throwing here fails fast during server startup / first import.
    throw new Error(
      `Invalid environment configuration:\n${formatZodError(parsed.error)}\n`
    );
  }
  return parsed.data;
})();
