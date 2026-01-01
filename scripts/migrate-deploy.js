#!/usr/bin/env node

// Simple migration script that runs Prisma migrations
// Prisma's env() helper in prisma.config.ts will read environment variables
const { execSync } = require('child_process');

// Verify at least one database URL is set
const hasDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!hasDbUrl) {
  console.error('❌ ERROR: DATABASE_URL or DIRECT_URL must be set');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DIRECT')).join(', ') || 'none');
  process.exit(1);
}

console.log('✅ Database URL is set');

// Run Prisma migrate deploy
// Prisma will use env() from prisma.config.ts to read the URL
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}
