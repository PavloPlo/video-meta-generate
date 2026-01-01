#!/usr/bin/env node

// Migration script that ensures DATABASE_URL is available for Prisma
// This works in both local development (reads from .env) and CI/CD (reads from env vars)

// Load .env files if they exist (for local development)
// In CI/CD, environment variables are already set by the workflow
try {
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // dotenv might not be available in some environments, that's ok
}

const { execSync } = require('child_process');

// Get the direct database URL (DIRECT_URL for migrations, DATABASE_URL for app)
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  console.error('❌ ERROR: DATABASE_URL or DIRECT_URL must be set');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DIRECT')).join(', ') || 'none');
  process.exit(1);
}

console.log('✅ Database URL is set');

// For migrations, always use DIRECT_URL and set DATABASE_URL to it
// This ensures prisma.config.ts can read it with env("DATABASE_URL")
const env = {
  ...process.env,
  DATABASE_URL: directUrl,
  DIRECT_URL: directUrl,
};

console.log('🔧 Environment configured for migrations');

// Run Prisma migrate deploy with explicit environment variables
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: env,
  });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}
