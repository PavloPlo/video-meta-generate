#!/usr/bin/env node

// Migration script for deploying Prisma migrations
// Loads env vars from .env files in local dev, uses existing env vars in CI/CD

try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config({ path: ".env" });
} catch (e) {
  // dotenv not available, using system env vars
}

const { execSync } = require("child_process");

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  console.error("❌ DATABASE_URL or DIRECT_URL must be set");
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: directUrl,
  DIRECT_URL: directUrl,
};

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
} catch (error) {
  console.error("❌ Migration failed");
  process.exit(1);
}
