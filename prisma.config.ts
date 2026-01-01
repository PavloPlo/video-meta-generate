import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env file if it exists (for local development)
dotenv.config();
dotenv.config({ path: ".env.local" });

// Prisma migrate deploy uses DIRECT_URL for direct database connections
// DATABASE_URL is used by Prisma Client for connection pooling
// For Supabase: DIRECT_URL bypasses PgBouncer, DATABASE_URL uses it
// Use DIRECT_URL for migrations, fallback to DATABASE_URL
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL or DIRECT_URL must be set. Found: ${Object.keys(process.env)
      .filter((k) => k.includes("DATABASE"))
      .join(", ")}`
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
