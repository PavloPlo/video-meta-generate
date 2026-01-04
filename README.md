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

### Quick Start (Recommended)

For a complete development environment with all services:

```bash
npm install
npm run dev:setup
```

This command will:
- Start PostgreSQL and MinIO containers
- Create `.env.local` with default development settings
- Run database migrations
- Seed the database with test data
- Start the Next.js development server

Open [http://localhost:3000](http://localhost:3000) to view the UI.

### Manual Setup

If you prefer to set up services individually:

```bash
npm install
npm run dev
```

Then follow the Docker setup instructions below.

## Available scripts

- `npm run dev` – Start the development server (requires manual Docker setup).
- `npm run dev:setup` – **Recommended**: Start complete development environment with all services.
- `npm run build` – Build the production bundle.
- `npm run start` – Run the production server after building.
- `npm run lint` – Run Next.js lint checks.

## Local Services (Docker)

Start PostgreSQL (local development only):

```bash
docker compose --profile local up -d postgres
```

Start MinIO (S3-compatible storage for local development):

```bash
docker compose --profile local up -d minio
```

Access MinIO Console: http://localhost:9001 (login: `minioadmin` / `minioadmin`)
- Create a bucket named `uploads` in the console

Start all local services:

```bash
docker compose --profile local up -d
```

Stop services:

```bash
docker compose --profile local down
```

Stop + wipe all data (destructive):

```bash
docker compose --profile local down -v
```

Set `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
```

**Or copy from example:**

```bash
cp env.example .env.local
# Then edit .env.local with your values
```

Prisma / Next integration notes

With Option A env validation, both URLs must be set in `.env.local`.

Prisma will use `DIRECT_URL` for migrations once schema is added (Task 1.3).

## Database Setup

### Run migrations

```bash
npm run db:deploy
```

### Seed the database (creates test user)

```bash
npm run db:seed
```

This creates a test user for local development:

| Field    | Value                                  |
|----------|----------------------------------------|
| ID       | `00000000-0000-0000-0000-000000000001` |
| Email    | `dev@example.com`                      |
| Username | `devuser`                              |
| Password | `password123`                          |

**Note:** The upload API route (`/api/upload`) uses this test user in development mode. Authentication is bypassed for easier local testing.

### Other database commands

```bash
npm run db:migrate   # Create new migration
npm run db:status    # Check migration status
npm run db:reset     # Reset database (destructive)
npm run db:studio    # Open Prisma Studio GUI
```

## File Storage Configuration

For file uploads to work (POST /api/upload), you need to configure storage. See `env.example` for detailed instructions.

**Quick setup options:**

1. **Local MinIO (Docker)** - Easiest for local development
   ```bash
   docker compose --profile local up -d minio
   ```
   Then use the MinIO configuration from `.env.example` (Option 3)

2. **Supabase Storage** - Good for development/staging
   - Create a Supabase project
   - Create a storage bucket
   - Configure S3-compatible credentials

3. **AWS S3** - Recommended for production
   - Create an S3 bucket
   - Create IAM user with S3 permissions
   - Configure access keys

See `.env.example` for complete configuration details.

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
