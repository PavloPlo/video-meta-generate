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
