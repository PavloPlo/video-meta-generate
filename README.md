# Video Meta Generate

Video Meta Generate is a Next.js (App Router) starter for building a video metadata
workflow in a single codebase. It provides a modern frontend UI scaffold along with
serverless API routes so you can prototype metadata pipelines, dashboards, and
supporting services together.

## What’s inside

- **Frontend workspace** – A Tailwind-styled landing page in `src/app/page.tsx`
  that introduces the product and highlights the main capabilities.
- **API routes** – Serverless endpoints live under `src/app/api` to support
  metadata processing and health checks.
- **TypeScript-first** – Type-safe React components and API handlers out of the box.
- **Tailwind CSS** – Utility-first styling configured in `tailwind.config.ts`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the UI.

## Available scripts

- `npm run dev` – Start the development server.
- `npm run build` – Build the production bundle.
- `npm run start` – Run the production server after building.
- `npm run lint` – Run Next.js lint checks.
- `npm run db:generate` – Generate Prisma Client.
- `npm run db:migrate` – Run migrations in development.
- `npm run db:deploy` – Deploy migrations (used in CI/CD).
- `npm run db:status` – Check migration status.
- `npm run db:reset` – Reset database (⚠️ destructive).
- `npm run db:studio` – Open Prisma Studio.

## Local Development

### Database Setup

Start local PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

Stop database:

```bash
docker compose down
```

Stop and wipe database (⚠️ **destructive - deletes all local data**):

```bash
docker compose down -v
```

### Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Local development - Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
```

**⚠️ Important:** Never commit `.env.local` to version control.

### Environment Setup

This project uses three separate environments with different databases:

| Environment | Database | Configuration |
|------------|----------|--------------|
| **Local** | Docker PostgreSQL | `.env.local` file |
| **Staging** | Supabase | GitHub Secrets: `STAGING_DATABASE_URL`, `STAGING_DIRECT_URL` |
| **Production** | Supabase | GitHub Secrets: `PROD_DATABASE_URL`, `PROD_DIRECT_URL` |

### Quick Setup Script

For automated setup, run:

```bash
bash scripts/setup-local.sh
```

This script will:
- Check Docker is running
- Create `.env.local` if missing
- Start PostgreSQL with Docker Compose
- Install dependencies
- Generate Prisma Client
- Run migrations

## Project structure

```
src/
  app/
    api/health/route.ts   # Example API endpoint
    globals.css           # Global styles (Tailwind base)
    layout.tsx            # Root layout
    page.tsx              # Landing page UI
```

## API routes

The starter endpoint is:

```
GET /api/health
```

It returns a simple JSON payload confirming the service is ready. Add more
endpoints in `src/app/api` for metadata generation, storage, or integrations.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Deployment

This project uses GitHub Actions for automated deployments to staging and production environments.

### Quick Deploy

**Deploy to Staging:**
```bash
git push origin dev
```

**Deploy to Production:**
```bash
git tag release-1.0.0
git push origin release-1.0.0
```

### Server Setup

Before first deployment, prepare your server:

1. **Create deploy user:**
   ```bash
   sudo useradd -m -s /bin/bash deploy
   sudo -u deploy -H bash -lc 'cd ~ && pwd'  # test user works
   ```

2. **Setup Node.js and PM2 as deploy user:**
   ```bash
   # Install Node.js 20 (as root)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs

   # Install PM2 and setup systemd as deploy user
   sudo -u deploy -H bash -lc '
     npm install -g pm2
     pm2 startup systemd -u deploy --hp /home/deploy
   '
   ```

3. **Create deployment directories and run setup script:**
   ```bash
   # Create directories and set ownership
   sudo mkdir -p /srv/apps/video-meta-generate
   sudo mkdir -p /srv/apps/video-meta-generate-prod
   sudo chown -R deploy:deploy /srv/apps/video-meta-generate
   sudo chown -R deploy:deploy /srv/apps/video-meta-generate-prod

   # Run setup verification as deploy user
   sudo -u deploy -H bash -lc '
     cd /path/to/your/repo
     bash scripts/setup-server.sh
   '
   ```

4. **Setup GitHub Actions self-hosted runner:**
   - Go to repository Settings → Actions → Runners
   - Click "New self-hosted runner"
   - Follow Linux installation instructions
   - **Important:** Configure runner to run as the `deploy` user (or ensure it has access to PM2 and deployment directories)

### Required GitHub Secrets

Configure in Settings → Secrets and variables → Actions:

| Secret | Description | Example |
|--------|-------------|---------|
| `STAGING_DATABASE_URL` | Supabase pooling URL (staging) | `postgresql://...@...pooler.supabase.com:6543/postgres` |
| `STAGING_DIRECT_URL` | Supabase direct URL (staging) | `postgresql://...@...pooler.supabase.com:5432/postgres` |
| `PROD_DATABASE_URL` | Supabase pooling URL (production) | `postgresql://...@...pooler.supabase.com:6543/postgres` |
| `PROD_DIRECT_URL` | Supabase direct URL (production) | `postgresql://...@...pooler.supabase.com:5432/postgres` |

### Deployment Locations

| Environment | Path | PM2 Process | Port |
|-------------|------|-------------|------|
| **Staging** | `/srv/apps/video-meta-generate/current` | `video-meta-generate` | 3000 |
| **Production** | `/srv/apps/video-meta-generate-prod/current` | `video-meta-generate-prod` | 3000 |

### Common Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs video-meta-generate         # Staging
pm2 logs video-meta-generate-prod    # Production

# Restart
pm2 restart video-meta-generate      # Staging
pm2 restart video-meta-generate-prod # Production

# Rollback to previous deployment
cd /srv/apps/video-meta-generate
ls -lt | grep deploy-
ln -sfn deploy-[previous-timestamp] current
pm2 restart video-meta-generate
```

### Troubleshooting

**Application won't start:**
- Check logs: `pm2 logs video-meta-generate`
- Verify env file: `cat /srv/apps/video-meta-generate/current/.env`
- Check Node version: `node --version` (should be 20.x)
- Check PM2 status: `pm2 status`

**PM2 user/permission issues:**
- PM2 commands should run as the deploy user (configure GitHub Actions runner accordingly)
- Check PM2 home: `env | grep PM2_HOME`
- Verify systemd service: `sudo systemctl status pm2-deploy`

**Database connection issues:**
- Verify GitHub Secrets are set correctly
- Test connection from server to Supabase
- Check migration status: `cd /srv/apps/video-meta-generate/current && npm run db:status`

**Deployment directory issues:**
- Verify files exist: `ls -la /srv/apps/video-meta-generate/current/`
- Check permissions: `ls -ld /srv/apps/video-meta-generate/current/`
- Ensure deploy user owns directory: `sudo chown -R deploy:deploy /srv/apps/video-meta-generate`

**Rollback procedure:**
Each deployment creates a timestamped directory. List them with `ls -lt | grep deploy-`, then update the `current` symlink to point to a previous deployment and restart PM2.