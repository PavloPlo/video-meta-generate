import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env files for local development
dotenv.config();
dotenv.config({ path: ".env.local" });

// Prisma reads DATABASE_URL from environment variables
// For Supabase migrations: use DIRECT_URL (port 5432, bypasses PgBouncer)
// For app connections: use DATABASE_URL (port 6543, uses PgBouncer)
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
