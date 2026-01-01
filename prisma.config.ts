import { defineConfig, env } from "prisma/config";

// Prisma's env() helper reads from environment variables at the right time
// For Supabase migrations: use DIRECT_URL (port 5432, bypasses PgBouncer)
// For app connections: use DATABASE_URL (port 6543, uses PgBouncer)
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
