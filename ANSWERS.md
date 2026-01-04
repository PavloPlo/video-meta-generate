# Project Context for Codex Implementation

## Overview

This document provides all necessary context for implementing API endpoints for the `video-meta-generate` Next.js application. Use this as a reference when generating implementation code.

---

## 1) Repo + Runtime

| Property | Value |
|----------|-------|
| **Framework** | Next.js (latest, App Router) |
| **Deployment** | Docker (self-hosted, `node:20-alpine` base image) |
| **Runtime** | Node.js 20 (Alpine Linux) |
| **Package Manager** | npm (`package-lock.json`) |
| **TypeScript** | Strict mode enabled |
| **Linting** | ESLint with `eslint-config-next` |
| **Styling** | Tailwind CSS |

### Key Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run db:migrate   # Prisma migrations
npm run db:generate  # Generate Prisma client
```

### Path Aliases
- `@/*` → `./src/*`

---

## 2) Authentication & User Identity

| Property | Value |
|----------|-------|
| **Auth Type** | Custom session-based authentication |
| **Session Storage** | PostgreSQL via Prisma (`Session` model) |
| **User ID Type** | `string` (UUID) |
| **Cookie Name** | Configurable via `SESSION_COOKIE_NAME` env (default: `"sid"`) |

### Getting Current User in API Routes

```typescript
import { getCurrentUser } from '@/lib/auth.server';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // user.id is string (UUID)
  // user.email, user.username available
}
```

### Existing Auth Implementation

```typescript
// src/lib/auth.server.ts
import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env.server";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
```

---

## 3) Database & ORM

| Property | Value |
|----------|-------|
| **ORM** | Prisma `^7.2.0` |
| **Database** | PostgreSQL 16 |
| **Migrations** | `prisma/migrations/` |

### Current Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "library"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  username     String    @unique
  passwordHash String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions Session[]
}

model Session {
  id     String @id
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

### Prisma Client Singleton

```typescript
// src/lib/db/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 4) Storage Solution

| Property | Value |
|----------|-------|
| **Development** | Supabase Storage (S3-compatible) |
| **Production** | AWS S3 |
| **Abstraction** | AWS SDK with configurable endpoints |

### Architecture Decision
Use `@aws-sdk/client-s3` with environment-based endpoint configuration. Both Supabase Storage and AWS S3 support the S3 protocol, allowing seamless switching.

### Dependencies to Install
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Storage Configuration Pattern

```typescript
// src/lib/storage/client.ts
import "server-only";
import { S3Client } from '@aws-sdk/client-s3';

export const storageClient = new S3Client({
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
});

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET!;
```

### Environment Variables

```bash
# Development (Supabase Storage)
STORAGE_ENDPOINT=https://<project-id>.supabase.co/storage/v1/s3
STORAGE_REGION=us-east-1
STORAGE_BUCKET=uploads
STORAGE_ACCESS_KEY_ID=<supabase-access-key>
STORAGE_SECRET_ACCESS_KEY=<supabase-secret-key>
STORAGE_FORCE_PATH_STYLE=true

# Production (AWS S3)
STORAGE_ENDPOINT=https://s3.us-east-1.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_BUCKET=your-bucket-name
STORAGE_ACCESS_KEY_ID=<aws-access-key>
STORAGE_SECRET_ACCESS_KEY=<aws-secret-key>
STORAGE_FORCE_PATH_STYLE=false
```

---

## 5) AI Provider Integration

| Property | Value |
|----------|-------|
| **SDK** | Vercel AI SDK (`ai` package) |
| **Default Provider** | OpenAI |
| **Text Model** | GPT-4o |
| **Image Model** | DALL-E 3 |
| **Abstraction** | Provider-agnostic via Vercel AI SDK |

### Architecture Decision
Use Vercel AI SDK for provider-agnostic LLM access. Supports OpenAI, Anthropic, Google, Mistral, and any OpenAI-compatible endpoint (Groq, Together, Ollama).

### Dependencies to Install
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic openai
```

### AI Configuration Pattern

```typescript
// src/lib/ai/provider.ts
import "server-only";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export function getAIProvider() {
  const provider = process.env.AI_PROVIDER ?? 'openai';
  
  switch (provider) {
    case 'openai':
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL, // Optional: OpenAI-compatible endpoints
      });
    case 'anthropic':
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export const AI_MODELS = {
  text: process.env.AI_TEXT_MODEL ?? 'gpt-4o',
  image: process.env.AI_IMAGE_MODEL ?? 'dall-e-3',
} as const;
```

### Text Generation Pattern

```typescript
// src/lib/ai/metadata.ts
import "server-only";
import { generateText } from 'ai';
import { getAIProvider, AI_MODELS } from './provider';

export async function generateDescription(params: {
  hookText: string;
  tone: 'viral' | 'curiosity' | 'educational';
}): Promise<string> {
  const provider = getAIProvider();
  
  const { text } = await generateText({
    model: provider(AI_MODELS.text),
    system: `You are a YouTube SEO expert. Generate engaging video descriptions.`,
    prompt: `Generate a YouTube description for a video with hook: "${params.hookText}". Tone: ${params.tone}. Max 5000 characters.`,
  });
  
  return text;
}

export async function generateTags(params: {
  hookText: string;
  tone: 'viral' | 'curiosity' | 'educational';
  description?: string;
}): Promise<string[]> {
  const provider = getAIProvider();
  
  const { text } = await generateText({
    model: provider(AI_MODELS.text),
    system: `You are a YouTube SEO expert. Generate relevant tags.`,
    prompt: `Generate 15 YouTube tags for: "${params.hookText}". Tone: ${params.tone}. Return comma-separated list only.`,
  });
  
  return text.split(',').map(tag => tag.trim()).slice(0, 15);
}
```

### Image Generation Pattern (DALL-E)

```typescript
// src/lib/ai/thumbnails.ts
import "server-only";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateThumbnailImage(params: {
  hookText: string;
  tone: 'viral' | 'curiosity' | 'educational';
}): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `YouTube thumbnail: ${params.hookText}. Style: ${params.tone}, eye-catching, high contrast, readable text overlay space.`,
    n: 1,
    size: '1792x1024', // Close to YouTube 16:9 ratio
  });
  
  return response.data[0].url!;
}
```

### Environment Variables

```bash
# AI Configuration
AI_PROVIDER=openai
AI_TEXT_MODEL=gpt-4o
AI_IMAGE_MODEL=dall-e-3

# OpenAI
OPENAI_API_KEY=sk-...
# Optional: Use OpenAI-compatible endpoint
# OPENAI_BASE_URL=https://api.together.xyz/v1

# Anthropic (alternative)
# ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6) Existing Patterns to Follow

### API Route Structure

```typescript
// src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth.server';

const RequestSchema = z.object({
  // Define request body schema
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validation
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // 3. Business logic
    // ...

    // 4. Success response
    return NextResponse.json({ data: result });
  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Existing Health Check Route

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "video-meta-generate" });
}
```

### Validation with Zod

Zod `^4.2.1` is already installed. Use for all request validation:

```typescript
import { z } from 'zod';

const GenerateThumbnailsSchema = z.object({
  hookText: z.string().max(200),
  tone: z.enum(['viral', 'curiosity', 'educational']),
  source: z.object({
    type: z.enum(['videoFrames', 'images']),
    assetIds: z.array(z.string().uuid()),
  }),
  count: z.number().int().min(1).max(6).default(3),
});
```

---

## 7) Analytics (GA4)

| Property | Value |
|----------|-------|
| **Platform** | Google Analytics 4 (GA4) |
| **Client Tracking** | `gtag()` via `next/script` |
| **Server Events** | `POST /api/synch` → GA4 Measurement Protocol |
| **Endpoint Name** | `/api/synch` (avoids ad blocker interference) |

### GA4 Setup

#### Environment Variables

```bash
# GA4 Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# For server-side events (Measurement Protocol)
GA_API_SECRET=<your-api-secret>
```

#### Client-Side: gtag.js Integration

```typescript
// src/components/organisms/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@/components/organisms/GoogleAnalytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

#### Client-Side: Event Tracking Helper

```typescript
// src/lib/analytics.ts
type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
};

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent({ action, category, label, value, ...params }: GTagEvent) {
  if (typeof window === 'undefined' || !window.gtag) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[GA4]', action, { category, label, value, ...params });
    }
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...params,
  });
}

// Convenience functions for common events
export const analytics = {
  // Page views (automatic with gtag config, but can be called manually for SPA)
  pageView: (url: string) => {
    window.gtag?.('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  },

  // Generation events
  generateStart: (type: 'thumbnails' | 'description' | 'tags') => {
    trackEvent({ action: 'generate_start', category: 'generation', label: type });
  },

  generateSuccess: (type: 'thumbnails' | 'description' | 'tags', duration?: number) => {
    trackEvent({ action: 'generate_success', category: 'generation', label: type, value: duration });
  },

  generateError: (type: 'thumbnails' | 'description' | 'tags', error: string) => {
    trackEvent({ action: 'generate_error', category: 'generation', label: type, error_message: error });
  },

  // Upload events
  uploadStart: (fileType: 'video' | 'image') => {
    trackEvent({ action: 'upload_start', category: 'upload', label: fileType });
  },

  uploadComplete: (fileType: 'video' | 'image', fileSize: number) => {
    trackEvent({ action: 'upload_complete', category: 'upload', label: fileType, value: fileSize });
  },

  // UI interactions
  thumbnailSelect: (variantIndex: number) => {
    trackEvent({ action: 'thumbnail_select', category: 'ui', value: variantIndex });
  },

  regenerateClick: () => {
    trackEvent({ action: 'regenerate_click', category: 'ui' });
  },
};
```

#### Server-Side: GA4 Measurement Protocol (via /api/synch)

For server-side events or when client-side gtag is blocked:

```typescript
// src/app/api/synch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

const EventSchema = z.object({
  clientId: z.string().min(1),
  events: z.array(z.object({
    name: z.string().min(1).max(40),
    params: z.record(z.unknown()).optional(),
  })),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Skip if GA not configured
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const body = await request.json();
    const validated = EventSchema.parse(body);

    // Forward to GA4 Measurement Protocol
    const response = await fetch(
      `${GA_ENDPOINT}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: validated.clientId,
          user_id: validated.userId,
          events: validated.events,
        }),
      }
    );

    if (!response.ok) {
      console.error('GA4 Measurement Protocol error:', response.status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log but don't fail - analytics should never block functionality
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
```

#### Client Helper for Server-Side Events

```typescript
// src/lib/analytics.ts (add to existing file)
import { API_ENDPOINTS } from '@/constants/api';

// Get or create a client ID for GA4
function getClientId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let clientId = localStorage.getItem('ga_client_id');
  if (!clientId) {
    clientId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ga_client_id', clientId);
  }
  return clientId;
}

// Send event via server (for when gtag might be blocked)
export function trackEventServer(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  fetch(API_ENDPOINTS.SYNCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: getClientId(),
      events: [{ name, params }],
    }),
    keepalive: true,
  }).catch(() => {
    // Silently fail
  });
}
```

### Event Naming Conventions (GA4 Compatible)

```typescript
// src/constants/analytics.ts
export const ANALYTICS_EVENTS = {
  // Existing
  SCROLL_DEPTH: 'scroll_depth',
  CTA_CLICK: 'cta_click',
  EXAMPLE_VIEW: 'example_view',
  FAQ_EXPAND: 'faq_expand',
  
  // Generation flow
  GENERATE_START: 'generate_start',
  GENERATE_SUCCESS: 'generate_success',
  GENERATE_ERROR: 'generate_error',
  
  // Upload flow
  UPLOAD_START: 'upload_start',
  UPLOAD_COMPLETE: 'upload_complete',
  UPLOAD_ERROR: 'upload_error',
  
  // UI interactions
  THUMBNAIL_SELECT: 'thumbnail_select',
  REGENERATE_CLICK: 'regenerate_click',
  COPY_DESCRIPTION: 'copy_description',
  COPY_TAGS: 'copy_tags',
} as const;

// GA4 recommended event parameters
export const ANALYTICS_PARAMS = {
  CONTENT_TYPE: 'content_type',     // 'thumbnail' | 'description' | 'tags'
  FILE_TYPE: 'file_type',           // 'video' | 'image'
  TONE: 'tone',                     // 'viral' | 'curiosity' | 'educational'
  ERROR_MESSAGE: 'error_message',
  DURATION_MS: 'duration_ms',
} as const;
```

### Usage in Components

```typescript
// Example: In VideoMetadataForm.tsx
import { analytics } from '@/lib/analytics';

const handleGenerateAll = async () => {
  const startTime = Date.now();
  analytics.generateStart('thumbnails');
  
  try {
    await generateThumbnailsSection();
    analytics.generateSuccess('thumbnails', Date.now() - startTime);
  } catch (error) {
    analytics.generateError('thumbnails', error.message);
  }
};
```

---

## 8) Testing Setup

| Framework | Purpose | Config |
|-----------|---------|--------|
| **Jest** | Unit + Component tests | `jest.config.js` |
| **Testing Library** | React component testing | `@testing-library/react` |
| **Playwright** | E2E tests | `playwright.config.ts` |

### Test Directory Structure

```
tests/
├── components/
│   ├── atoms/          # Component unit tests
│   └── molecules/
├── unit/
│   └── lib/            # Utility function tests
└── e2e/                # Playwright E2E tests (empty currently)
```

### Unit Test Pattern

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const handler = jest.fn();
    const user = userEvent.setup();
    
    render(<Component onClick={handler} />);
    await user.click(screen.getByRole('button'));
    
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
```

### API Route Test Pattern (Recommended)

```typescript
// tests/api/upload.test.ts
import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

// Mock auth
jest.mock('@/lib/auth.server', () => ({
  getCurrentUser: jest.fn(),
}));

describe('POST /api/upload', () => {
  it('should return 401 if not authenticated', async () => {
    const { getCurrentUser } = require('@/lib/auth.server');
    getCurrentUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
```

---

## 9) API Endpoints to Implement

### Update API Constants

```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  UPLOAD: '/api/upload',
  VIDEOS: '/api/videos',
  METADATA: '/api/metadata',
  METADATA_DESCRIPTION: '/api/metadata/description',
  METADATA_TAGS: '/api/metadata/tags',
  SYNCH: '/api/synch',
  THUMBNAILS_GENERATE: '/api/thumbnails/generate',
  THUMBNAILS_REGENERATE: '/api/thumbnails/regenerate',
} as const;
```

### Endpoints Needed

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/upload` | POST | Upload video/images | Yes |
| `/api/thumbnails/generate` | POST | Generate initial thumbnails | Yes |
| `/api/thumbnails/regenerate` | POST | Generate more thumbnails | Yes |
| `/api/metadata/description` | POST | Generate video description | Yes |
| `/api/metadata/tags` | POST | Generate video tags | Yes |
| `/api/synch` | POST | Track analytics events (GA4) | No |

### File Structure to Create

```
src/app/api/
├── health/
│   └── route.ts          # ✅ Exists
├── upload/
│   └── route.ts          # 🆕 Create
├── thumbnails/
│   ├── generate/
│   │   └── route.ts      # 🆕 Create
│   └── regenerate/
│       └── route.ts      # 🆕 Create
├── metadata/
│   ├── description/
│   │   └── route.ts      # 🆕 Create
│   └── tags/
│       └── route.ts      # 🆕 Create
└── synch/
    └── route.ts          # 🆕 Create

src/lib/
├── storage/
│   └── client.ts         # 🆕 Create (S3 client)
├── ai/
│   ├── provider.ts       # 🆕 Create (AI provider config)
│   ├── metadata.ts       # 🆕 Create (description/tags generation)
│   └── thumbnails.ts     # 🆕 Create (image generation)
├── analytics.ts          # 🔄 Update (GA4 integration)
├── auth.server.ts        # ✅ Exists
├── db/
│   └── prisma.ts         # ✅ Exists
└── thumbnails.ts         # ✅ Exists (client-side API calls)
```

---

## 10) Prisma Models to Add

```prisma
model Asset {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fileName  String
  fileType  String
  fileSize  Int
  storageKey String  @unique  // S3/Supabase key
  publicUrl  String?
  
  // Video-specific metadata
  duration   Int?     // seconds
  width      Int?
  height     Int?
  
  createdAt DateTime @default(now())
  
  thumbnails GeneratedThumbnail[]
  
  @@index([userId])
}

model GeneratedThumbnail {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  assetId   String?  // Source asset if from upload
  asset     Asset?   @relation(fields: [assetId], references: [id], onDelete: SetNull)
  
  imageUrl  String
  storageKey String? @unique  // If stored in S3
  hookText  String?
  tone      String
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([assetId])
}

// Update User model to add relations
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  username     String    @unique
  passwordHash String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions   Session[]
  assets     Asset[]
  thumbnails GeneratedThumbnail[]
}
```

---

## 11) Environment Variables Summary

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Session
SESSION_COOKIE_NAME=sid
SESSION_TTL_DAYS=14

# Storage (S3-compatible)
STORAGE_ENDPOINT=https://...
STORAGE_REGION=us-east-1
STORAGE_BUCKET=uploads
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_FORCE_PATH_STYLE=true  # true for Supabase, false for AWS

# AI
AI_PROVIDER=openai
AI_TEXT_MODEL=gpt-4o
AI_IMAGE_MODEL=dall-e-3
OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=  # Optional: for OpenAI-compatible endpoints
# ANTHROPIC_API_KEY=  # If using Anthropic

# Analytics (GA4)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=<your-api-secret>

# App
NODE_ENV=development
```

---

## 12) Dependencies to Add

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.700.0",
    "@aws-sdk/s3-request-presigner": "^3.700.0",
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.70",
    "@ai-sdk/anthropic": "^0.0.50",
    "openai": "^4.70.0"
  }
}
```

Install command:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner ai @ai-sdk/openai @ai-sdk/anthropic openai
```

---

## 13) Summary of Architecture Decisions

| Component | Development | Production | Abstraction |
|-----------|-------------|------------|-------------|
| **Storage** | Supabase Storage | AWS S3 | AWS SDK with configurable endpoints |
| **Text AI** | OpenAI GPT-4o | OpenAI GPT-4o | Vercel AI SDK (provider-agnostic) |
| **Image AI** | OpenAI DALL-E 3 | OpenAI DALL-E 3 | OpenAI SDK |
| **Analytics** | GA4 | GA4 | gtag.js + /api/synch (Measurement Protocol) |
| **Database** | PostgreSQL | PostgreSQL | Prisma ORM |
| **Auth** | Custom sessions | Custom sessions | Cookie-based with Prisma |

### Key Benefits:
- ✅ Single codebase for dev/prod
- ✅ Environment-variable-based provider switching
- ✅ No code changes when switching storage providers
- ✅ Support for 10+ LLM providers via Vercel AI SDK
- ✅ GA4 with server-side fallback for ad-blocker resilience


