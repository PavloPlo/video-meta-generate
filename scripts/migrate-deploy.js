#!/usr/bin/env node

// Simple migration script - just ensures environment variables are set and runs Prisma
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

// Get database URL (DIRECT_URL for migrations, fallback to DATABASE_URL)
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL or DIRECT_URL must be set');
  process.exit(1);
}

// Set environment variables for Prisma
process.env.DATABASE_URL = databaseUrl;
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = databaseUrl;
}

// Run Prisma migrate deploy
// Prisma will read DATABASE_URL from environment variables
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}
