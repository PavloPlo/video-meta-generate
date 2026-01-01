import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env file if it exists (for local development)
// This runs at module load time, so environment variables must be set before this file is imported
dotenv.config();
dotenv.config({ path: ".env.local" });

// Prisma migrate deploy uses DIRECT_URL for direct database connections
// DATABASE_URL is used by Prisma Client for connection pooling
// For Supabase: DIRECT_URL bypasses PgBouncer, DATABASE_URL uses it
// Use DIRECT_URL for migrations, fallback to DATABASE_URL
// Read directly from process.env to ensure we get the latest value
// IMPORTANT: This config is evaluated when Prisma loads it, so env vars must be set before
const getDatabaseUrl = () => {
  // Try multiple sources
  const directUrl = process.env.DIRECT_URL;
  const databaseUrl = process.env.DATABASE_URL;
  const url = directUrl || databaseUrl;
  
  if (!url) {
    const available = Object.keys(process.env).filter((k) => k.includes("DATABASE"));
    const error = `DATABASE_URL or DIRECT_URL must be set. Available env vars: ${available.join(", ") || "none"}`;
    console.error("❌ Prisma config error:", error);
    throw new Error(error);
  }
  
  return url;
};

const databaseUrl = getDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
