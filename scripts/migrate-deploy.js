#!/usr/bin/env node

// Migration deployment script that ensures environment variables are loaded
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

// Verify environment variables
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL or DIRECT_URL must be set');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
  process.exit(1);
}

console.log('✅ Database URL found (length:', databaseUrl.length + ')');
console.log('✅ Using:', databaseUrl === process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL');

// Run Prisma migrate deploy
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      DIRECT_URL: process.env.DIRECT_URL || databaseUrl,
    },
  });
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}
