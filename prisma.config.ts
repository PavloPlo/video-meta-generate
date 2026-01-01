import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load environment variables from .env file if it exists
dotenv.config();

// Prisma migrate deploy uses DIRECT_URL for direct database connections
// DATABASE_URL is used by Prisma Client for connection pooling
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL or DIRECT_URL must be set");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('DATABASE')));
  throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

console.log("✅ Prisma config loaded with database URL (length:", databaseUrl.length + ")");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
