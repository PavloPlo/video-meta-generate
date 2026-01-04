# API Endpoints Implementation Plan

## Analysis Summary

Based on the analysis of `src/app/create-youtube-metainformation/page.tsx` and related components, the page requires the following functionality:

1. **File Upload** - Upload video files or images for thumbnail generation
2. **Thumbnail Generation** - Generate thumbnail variants from uploaded assets
3. **Thumbnail Regeneration** - Generate additional thumbnail variants
4. **Description Generation** - Generate YouTube video descriptions
5. **Tags Generation** - Generate YouTube video tags
6. **Analytics** - Track user interactions and events

## Required API Endpoints

### 1. File Upload Endpoint
**Endpoint:** `POST /api/upload`

**Purpose:** Upload video files or images to the server for processing

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: File (video or image)
  - `type`: `'video' | 'images'` (optional, can be inferred from file type)

**Response:**
```typescript
{
  assetId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number; // For videos
  thumbnailUrl?: string; // Preview thumbnail
  metadata?: {
    width?: number;
    height?: number;
  };
}
```

**Validation:**
- File size limits (500MB for videos, 10MB for images)
- File format validation (mp4, mov, avi, webm for videos; jpeg, png, gif, webp for images)
- Video duration limit (2 hours max)
- Maximum 10 images per upload

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `413` - File too large
- `415` - Unsupported file type
- `500` - Server error

---

### 2. Thumbnail Generation Endpoint
**Endpoint:** `POST /api/thumbnails/generate`

**Purpose:** Generate initial thumbnail variants from uploaded assets

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```typescript
{
  hookText: string; // Max 200 chars, recommended 70
  tone: 'viral' | 'curiosity' | 'educational';
  source: {
    type: 'videoFrames' | 'images';
    assetIds: string[]; // Array of uploaded asset IDs
  };
  count: number; // Number of variants to generate (default: 3, max: 6)
}
```

**Response:**
```typescript
{
  variants: Array<{
    id: string;
    imageUrl: string;
    readability?: 'good' | 'ok' | 'poor';
  }>;
}
```

**Error Response:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR';
    message: string;
  };
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `429` - Rate limited
- `500` - Server error

**Notes:**
- Requires authentication (user must be logged in)
- Validates that assetIds exist and belong to the user
- Validates hookText length (max 200 chars)
- Validates count (1-6 variants)

---

### 3. Thumbnail Regeneration Endpoint
**Endpoint:** `POST /api/thumbnails/regenerate`

**Purpose:** Generate additional thumbnail variants (adds to existing set)

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: Same as `/api/thumbnails/generate`

**Response:**
- Same as `/api/thumbnails/generate`

**Status Codes:**
- Same as `/api/thumbnails/generate`

**Notes:**
- Same validation as generate endpoint
- Used when user wants more variants (up to 6 total)
- Should track regeneration count per session

---

### 4. Description Generation Endpoint
**Endpoint:** `POST /api/metadata/description`

**Purpose:** Generate YouTube video description based on hook text and tone

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```typescript
{
  hookText: string;
  tone: 'viral' | 'curiosity' | 'educational';
  videoTitle?: string; // Optional
  additionalContext?: string; // Optional
}
```

**Response:**
```typescript
{
  description: string; // Max 5000 chars
}
```

**Error Response:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR';
    message: string;
  };
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `429` - Rate limited
- `500` - Server error

**Notes:**
- Requires authentication
- Validates hookText length
- Description should be optimized for YouTube SEO
- Max length: 5000 characters

---

### 5. Tags Generation Endpoint
**Endpoint:** `POST /api/metadata/tags`

**Purpose:** Generate YouTube video tags based on hook text and tone

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```typescript
{
  hookText: string;
  tone: 'viral' | 'curiosity' | 'educational';
  description?: string; // Optional, can improve tag relevance
}
```

**Response:**
```typescript
{
  tags: string[]; // Max 15 tags
}
```

**Error Response:**
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR';
    message: string;
  };
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `429` - Rate limited
- `500` - Server error

**Notes:**
- Requires authentication
- Validates hookText length
- Max 15 tags
- Tags should be relevant and optimized for YouTube search

---

### 6. Analytics Endpoint (Optional)
**Endpoint:** `POST /api/analytics`

**Purpose:** Track user interactions and events

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```typescript
{
  event: string; // Event name (e.g., 'generate_thumbnails', 'regenerate_thumbnails')
  properties?: Record<string, any>; // Event properties
  userId?: string; // Optional, can be extracted from session
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `500` - Server error

**Notes:**
- Can be used for tracking generation events, errors, user behavior
- Should not block main functionality if it fails

---

## Implementation Actions

### Phase 1: Update Constants
1. ✅ **Update `src/constants/api.ts`**
   - Add `UPLOAD: '/api/upload'`
   - Add `METADATA_DESCRIPTION: '/api/metadata/description'`
   - Add `METADATA_TAGS: '/api/metadata/tags'`
   - Keep existing endpoints: `THUMBNAILS_GENERATE`, `THUMBNAILS_REGENERATE`, `ANALYTICS`

### Phase 2: File Upload Endpoint
2. **Create `src/app/api/upload/route.ts`**
   - Implement multipart form data parsing
   - Validate file size, format, and duration
   - Store uploaded files (local storage or cloud storage)
   - Generate preview thumbnails for videos
   - Extract video metadata (duration, dimensions)
   - Return asset ID and metadata
   - Handle errors gracefully

### Phase 3: Thumbnail Generation Endpoints
3. **Create `src/app/api/thumbnails/generate/route.ts`**
   - Validate request body (hookText, tone, source, count)
   - Verify assetIds exist and belong to user
   - Call thumbnail generation service (AI/ML service integration)
   - Return thumbnail variants with URLs
   - Handle rate limiting
   - Implement error handling

4. **Create `src/app/api/thumbnails/regenerate/route.ts`**
   - Similar to generate endpoint
   - Track regeneration count
   - Validate total variant count doesn't exceed 6

### Phase 4: Metadata Generation Endpoints
5. **Create `src/app/api/metadata/description/route.ts`**
   - Validate request body (hookText, tone)
   - Call description generation service (AI service integration)
   - Return generated description (max 5000 chars)
   - Handle rate limiting
   - Implement error handling

6. **Create `src/app/api/metadata/tags/route.ts`**
   - Validate request body (hookText, tone, optional description)
   - Call tags generation service (AI service integration)
   - Return array of tags (max 15)
   - Handle rate limiting
   - Implement error handling

### Phase 5: Analytics Endpoint (Optional)
7. **Create `src/app/api/analytics/route.ts`**
   - Accept event tracking requests
   - Log events to analytics service
   - Return success response
   - Don't block on errors

### Phase 6: Authentication & Authorization
8. **Add authentication middleware**
   - Verify user session for protected endpoints
   - Extract user ID from session
   - Validate user ownership of assets
   - Return 401 for unauthorized requests

### Phase 7: Database Schema (if needed)
9. **Update Prisma schema (if storing assets/metadata)**
   - Add `Asset` model for uploaded files
   - Add `ThumbnailVariant` model for generated thumbnails
   - Add `MetadataGeneration` model for tracking generations
   - Add relationships between User, Asset, and generated content

### Phase 8: Update Client Code
10. **Update `src/lib/thumbnails.ts`**
    - Already uses correct endpoints (no changes needed)

11. **Create `src/lib/metadata.ts`**
    - Add `generateDescription()` function
    - Add `generateTags()` function
    - Use API_ENDPOINTS constants

12. **Create `src/lib/upload.ts`**
    - Add `uploadFile()` function
    - Handle multipart form data
    - Return asset ID and metadata

13. **Update `src/components/templates/VideoMetadataForm.tsx`**
    - Replace mock `generateDescription()` with API call
    - Replace mock `generateTags()` with API call
    - Update `handleVideoUpload()` to use upload API
    - Update `handleImagesUpload()` to use upload API

14. **Update `src/components/molecules/VideoInputPanel.tsx`**
    - Integrate file upload API in `handleFileChange()`
    - Store returned asset IDs
    - Handle upload progress and errors

### Phase 9: Error Handling & Validation
15. **Create validation schemas**
    - Use Zod for request validation
    - Create schemas for each endpoint
    - Validate in route handlers

16. **Implement consistent error responses**
    - Standardize error response format
    - Include error codes and messages
    - Log errors server-side

### Phase 10: Rate Limiting
17. **Implement rate limiting**
    - Add rate limiting middleware
    - Limit requests per user/IP
    - Return 429 status with retry-after header

### Phase 11: Testing
18. **Write API route tests**
    - Test each endpoint with valid/invalid inputs
    - Test authentication and authorization
    - Test error handling
    - Test rate limiting

19. **Write E2E tests (Playwright)**
    - Test full user flow: upload → generate → regenerate
    - Test error scenarios
    - Test rate limiting behavior

---

## Dependencies & Services

### External Services Needed:
1. **File Storage** - AWS S3, Cloudinary, or local storage
2. **Thumbnail Generation** - AI/ML service (e.g., OpenAI, custom ML model)
3. **Description Generation** - AI service (e.g., OpenAI GPT)
4. **Tags Generation** - AI service (e.g., OpenAI GPT)

### Environment Variables:
- `UPLOAD_STORAGE_TYPE` - 'local' | 's3' | 'cloudinary'
- `UPLOAD_STORAGE_CONFIG` - Storage configuration
- `THUMBNAIL_GENERATION_API_KEY` - API key for thumbnail service
- `METADATA_GENERATION_API_KEY` - API key for metadata service
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per time window
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds

---

## File Structure

```
src/app/api/
├── upload/
│   └── route.ts
├── thumbnails/
│   ├── generate/
│   │   └── route.ts
│   └── regenerate/
│       └── route.ts
├── metadata/
│   ├── description/
│   │   └── route.ts
│   └── tags/
│       └── route.ts
└── analytics/
    └── route.ts

src/lib/
├── upload.ts
├── metadata.ts
└── thumbnails.ts (already exists)

src/constants/
└── api.ts (update with new endpoints)
```

---

## Priority Order

1. **High Priority:**
   - File Upload Endpoint
   - Thumbnail Generation Endpoint
   - Thumbnail Regeneration Endpoint

2. **Medium Priority:**
   - Description Generation Endpoint
   - Tags Generation Endpoint

3. **Low Priority:**
   - Analytics Endpoint
   - Rate Limiting
   - Database Schema Updates

---

## Notes

- All endpoints should follow the API best practices outlined in `AGENTS.md`
- Use Zod for validation at route boundaries
- Implement proper error handling with try-catch blocks
- Use Prisma `select` to return only needed fields
- Keep server/client boundaries clear (no Prisma in client components)
- All endpoints should be authenticated (except health check)
- Consider implementing request logging for debugging


