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

// Verify Supabase connection string format
const urlPattern = /postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/;
if (!urlPattern.test(databaseUrl)) {
  console.warn('⚠️  Warning: Database URL format may be incorrect');
  console.warn('Expected format: postgresql://user:password@host:port/database');
}

// Extract connection details for verification (masked)
try {
  const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (urlMatch) {
    const [, user, , host, port, database] = urlMatch;
    console.log('🔍 Connection details:');
    console.log('  Host:', host);
    console.log('  Port:', port);
    console.log('  Database:', database);
    console.log('  User:', user);
    console.log('  Password:', '***');
  }
} catch (e) {
  // Ignore parsing errors
}

// Set environment variables explicitly for Prisma
// Use DIRECT_URL for migrations (bypasses PgBouncer)
process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = process.env.DIRECT_URL || databaseUrl;

// Verify environment variables are set
console.log('🔍 Verifying environment variables before Prisma:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.length} chars)` : 'NOT SET');
console.log('  DIRECT_URL:', process.env.DIRECT_URL ? `set (${process.env.DIRECT_URL.length} chars)` : 'NOT SET');

// Temporarily backup and replace prisma.config.ts to ensure it has the URL
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'prisma.config.ts');
const backupPath = path.join(process.cwd(), 'prisma.config.ts.backup');

try {
  // Backup original config
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
  }

  // Create a new config file that definitely has the URL
  const newConfig = `import { defineConfig } from "prisma/config";

// Database URL is set via environment variable or fallback to direct value
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "${databaseUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
`;
  
  fs.writeFileSync(configPath, newConfig);
  console.log('✅ Updated Prisma config with database URL');

  // Run Prisma migrate deploy with explicit environment
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: process.env.DIRECT_URL || databaseUrl,
  };

  execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', {
    stdio: 'inherit',
    env: env,
    cwd: process.cwd(),
  });

  // Restore original config
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
    console.log('✅ Restored original Prisma config');
  }
} catch (error) {
  // Restore original config on error
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
  }
  console.error('❌ Migration failed');
  console.error('Verify your Supabase connection strings:');
  console.error('  - DIRECT_URL should use port 5432 (direct connection)');
  console.error('  - DATABASE_URL can use port 6543 (PgBouncer) or 5432');
  console.error('\nDebug info:');
  console.error('  Current directory:', process.cwd());
  console.error('  DATABASE_URL value:', process.env.DATABASE_URL ? 'set' : 'not set');
  process.exit(1);
}
