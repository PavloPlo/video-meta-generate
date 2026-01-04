#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ServiceStatus {
  postgres: boolean;
  minio: boolean;
}

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = join(SCRIPT_DIR, '..');

class DevSetup {
  private envLocalPath = join(PROJECT_ROOT, '.env.local');

  private async checkDocker(): Promise<boolean> {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async checkDockerCompose(): Promise<boolean> {
    try {
      execSync('docker compose version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async checkServiceHealth(service: string): Promise<boolean> {
    try {
      const result = execSync(`docker compose --profile local ps ${service} --format json`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const container = JSON.parse(result.trim());
      return container.State === 'running' && container.Health === 'healthy';
    } catch {
      return false;
    }
  }

  private async getServiceStatus(): Promise<ServiceStatus> {
    const [postgres, minio] = await Promise.all([
      this.checkServiceHealth('postgres'),
      this.checkServiceHealth('minio')
    ]);

    return { postgres, minio };
  }

  private async startDockerServices(): Promise<void> {
    console.log('🐳 Starting Docker services...');

    const status = await this.getServiceStatus();

    if (!status.postgres || !status.minio) {
      console.log('  Starting postgres and minio containers...');
      execSync('docker compose --profile local up -d postgres minio', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      });

      // Wait for services to be healthy
      console.log('  Waiting for services to be healthy...');
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max

      while (attempts < maxAttempts) {
        const currentStatus = await this.getServiceStatus();
        if (currentStatus.postgres && currentStatus.minio) {
          console.log('✅ All Docker services are healthy');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
        console.log(`  Checking services health... (${attempts}/${maxAttempts})`);
      }

      throw new Error('Docker services failed to become healthy within timeout');
    } else {
      console.log('✅ Docker services are already running and healthy');
    }
  }

  private setupEnvironment(): void {
    if (existsSync(this.envLocalPath)) {
      console.log('✅ .env.local already exists');
      return;
    }

    console.log('📝 Creating .env.local file...');

    const envContent = `# Local development environment variables
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"

# Storage (MinIO)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_REGION="us-east-1"
STORAGE_BUCKET="uploads"
STORAGE_ACCESS_KEY_ID="minioadmin"
STORAGE_SECRET_ACCESS_KEY="minioadmin"
STORAGE_FORCE_PATH_STYLE="true"

# AI Configuration (optional - add your OpenAI API key for AI features)
# OPENAI_API_KEY="your-openai-api-key-here"
# AI_PROVIDER="openai"
# AI_TEXT_MODEL="gpt-4o"
# AI_IMAGE_MODEL="dall-e-3"

# Session Configuration
SESSION_COOKIE_NAME="sid"
SESSION_TTL_DAYS="14"

# Node Environment
NODE_ENV="development"
`;

    writeFileSync(this.envLocalPath, envContent);
    console.log('✅ Created .env.local with default development settings');
  }

  private runDatabaseSetup(): void {
    console.log('🗄️ Setting up database...');

    console.log('  Running database migrations...');
    execSync('npm run db:migrate', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    console.log('  Seeding database...');
    execSync('npm run db:seed', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    console.log('✅ Database setup complete');
  }

  private startDevServer(): void {
    console.log('🚀 Starting Next.js development server...');
    console.log('📱 App will be available at: http://localhost:3000');
    console.log('🗃️ MinIO Console available at: http://localhost:9001 (minioadmin/minioadmin)');
    console.log('');

    // Start the dev server and keep it running
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      devProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development environment...');
      devProcess.kill();
      process.exit(0);
    });
  }

  private async shutdownServices(): Promise<void> {
    console.log('🛑 Shutting down development environment...');

    try {
      console.log('  Stopping Docker services...');
      execSync('docker compose --profile local down', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      });
      console.log('✅ Docker services stopped');

      console.log('  Cleaning up containers and volumes...');
      execSync('docker compose --profile local down -v', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
      });
      console.log('✅ Containers and volumes cleaned up');

      console.log('🎉 Development environment shut down successfully!');
    } catch (error) {
      console.error('❌ Error during shutdown:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  async run(): Promise<void> {
    console.log('🔧 Video Meta Generate development environment tool\n');

    try {
      // Start Docker services
      await this.startDockerServices();

      // Setup environment
      this.setupEnvironment();

      // Setup database
      this.runDatabaseSetup();

      // Start dev server
      console.log('🎉 Development environment is ready!');
      this.startDevServer();

    } catch (error) {
      console.error('❌ Setup failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
    console.log('🔧 Video Meta Generate development environment tool\n');

    // Check prerequisites (only Docker is needed for shutdown)
    console.log('🔍 Checking prerequisites...');

    const dockerAvailable = await this.checkDocker();
    if (!dockerAvailable) {
      console.error('❌ Docker is not available. Please install Docker and try again.');
      console.log('   Download: https://docs.docker.com/get-docker/');
      process.exit(1);
    }
    console.log('✅ Docker is available');

    await this.shutdownServices();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'setup';

const setup = new DevSetup();

if (command === 'shutdown' || command === 'down' || command === 'stop') {
  setup.shutdown().catch((error) => {
    console.error('💥 Unexpected error during shutdown:', error);
    process.exit(1);
  });
} else if (command === 'setup' || command === 'up' || command === 'start') {
  setup.run().catch((error) => {
    console.error('💥 Unexpected error during setup:', error);
    process.exit(1);
  });
} else {
  console.log('Usage: npm run dev:setup [command]');
  console.log('');
  console.log('Commands:');
  console.log('  setup, up, start  - Start the development environment (default)');
  console.log('  shutdown, down, stop - Stop and clean up the development environment');
  console.log('');
  console.log('Examples:');
  console.log('  npm run dev:setup          # Start development environment');
  console.log('  npm run dev:setup shutdown # Stop development environment');
  process.exit(1);
}
