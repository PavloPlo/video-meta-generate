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

## Local Development

### Database Setup

Start local PostgreSQL database:

```bash
docker compose up -d
```

Stop DB:

```bash
docker compose down
```

Stop + wipe DB (destructive - **⚠️ This will delete all your local data**):

```bash
docker compose down -v
```

### Environment Configuration

Create a `.env.local` file in the project root:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
```

**⚠️ Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### Environment Isolation

Your setup ensures different databases for each environment:

- **Local Development**: Uses Docker PostgreSQL container (`localhost:5432/app`)
- **Staging**: Uses `secrets.STAGING_DATABASE_URL` (remote database)
- **Production**: Uses `secrets.PROD_DATABASE_URL` (remote database)

**Environment Variables Required:**
- `DATABASE_URL` and `DIRECT_URL` must be set for all environments
- Local development reads from `.env.local`
- Staging/Production read from GitHub Secrets

### Prisma Commands

```bash
# Generate Prisma client (local)
npm run db:generate

# Run migrations in development
npm run db:migrate

# Reset database (⚠️ destructive)
npm run db:reset

# View database in browser
npm run db:studio
```

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

### Accessing Your Application

After a successful deployment via GitHub Actions:

1. **Default Access**: The application runs on port **3000**
   - Direct access: `http://your-server-ip:3000`
   - With domain: `http://your-domain.com:3000`

2. **Check Application Status**: SSH into your server and run:
   ```bash
   pm2 status
   pm2 logs video-meta-generate
   ```

3. **Production Setup (Recommended)**: Configure a reverse proxy (nginx/Caddy) for:
   - HTTPS/SSL termination
   - Clean URLs (without :3000)
   - Better security and performance

### Deployment Locations

- **Application**: `/srv/apps/video-meta-generate/current`
- **Logs**: `/srv/apps/video-meta-generate/current/logs/`
- **PM2 Process Name**: `video-meta-generate`

### Manual Deployment Commands

```bash
# View application status
pm2 status video-meta-generate

# View logs
pm2 logs video-meta-generate

# Restart application
pm2 restart video-meta-generate

# Stop application
pm2 stop video-meta-generate
```