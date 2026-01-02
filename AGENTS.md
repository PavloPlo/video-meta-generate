# AGENTS.md — Codex project instructions (Next.js)

## Goals
- Keep the codebase **predictable, maintainable, and easy to redesign**.
- Prefer **boring, proven patterns** over cleverness.
- Optimize for **readability, type-safety, accessibility, and performance**.
- **Atomic component architecture**: Build all pages from reusable atomic components with flexible props.
- **Structured organization**: Centralize components, constants, and utilities in dedicated folders.

## Project structure
### Folder organization
- `src/app/` - Next.js App Router pages and layouts (composition only, no UI components)
- `src/components/` - **All reusable components** organized by atomic design:
  - `atoms/` - Basic building blocks (Button, Input, Typography, etc.)
  - `molecules/` - Simple combinations of atoms (FormField, Card, etc.)
  - `organisms/` - Complex UI sections (Header, Sidebar, etc.)
  - `templates/` - Page-level layouts (Dashboard, Landing, etc.)
- `src/constants/` - All shared constants in structured files:
  - `routes.ts` - Route paths and navigation constants
  - `validation.ts` - Validation rules and messages
  - `api.ts` - API endpoints and configurations
  - Domain-specific files as needed (e.g., `video.ts`, `auth.ts`)
- `src/lib/` - Business logic, utilities, and data fetching (grouped by domain)
- `src/styles/` - Styling tokens and global styles

### Component rules
- **All components must live in `src/components/`** - No components defined directly in pages
- **Atomic design pattern**: Atoms → Molecules → Organisms → Templates → Pages
- **Props-driven**: Components accept typed props for maximum reusability
- **Variants over duplication**: Use component variants instead of multiple similar components
- **Composition over inheritance**: Build complex UIs by composing simpler components
- **Accessibility built-in**: Include ARIA attributes, focus management, and keyboard navigation
- **Responsive by default**: Components should work across all screen sizes
- **Theme-aware**: Use design tokens for colors, spacing, and typography

### Constants rules
- **All constants in `src/constants/`** - No magic strings or numbers scattered in components
- **Structured by domain**: Group related constants in dedicated files
- **Typed enums/unions**: Use TypeScript enums or const assertions for type safety
- **Environment-aware**: Separate development/production constants when needed

### Constants Structure Examples
```ts
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VIDEO_GENERATE: '/create-youtube-metainformation',
} as const;

// src/constants/validation.ts
export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 15,
} as const;

// src/constants/api.ts
export const API_ENDPOINTS = {
  VIDEOS: '/api/videos',
  METADATA: '/api/metadata',
  ANALYTICS: '/api/analytics',
} as const;
```

### Migrating Existing Constants
When refactoring existing code to use the constants folder:

1. **Identify constants**: Look for magic strings, numbers, or arrays defined in components
2. **Create domain files**: Group related constants in appropriate files under `src/constants/`
3. **Use const assertions**: Apply `as const` for type safety and autocompletion
4. **Update imports**: Replace inline constants with imports from constants files
5. **Verify usage**: Ensure all references are updated and tests pass

**Example Migration:**
```tsx
// Before (in component)
const navLinks = [
  { label: "Proof", href: "#proof" },
  { label: "Features", href: "#features" },
];

// After (constants/navigation.ts)
export const NAVIGATION_LINKS = [
  { label: "Proof", href: "#proof" },
  { label: "Features", href: "#features" },
] as const;

// Component usage
import { NAVIGATION_LINKS } from '@/constants/navigation';
```

## How to run this project
Use the package manager already used by the repo (based on lockfile):
- `pnpm-lock.yaml` → `pnpm`
- `yarn.lock` → `yarn`
- `package-lock.json` → `npm`

Common commands (replace `<pm>` with pnpm/yarn/npm):
- Install: `<pm> install` (npm: `npm ci` in CI)
- Dev: `<pm> run dev`
- Build: `<pm> run build`
- Start: `<pm> run start`
- **Lint (required): `<pm> run lint`**
- Typecheck (if present): `<pm> run typecheck`

## Hard requirement: lint after every change
After **any** code change (even small), you must:
1. Run: `<pm> run lint`
2. Fix all reported issues in touched code.
3. Avoid introducing new warnings/errors anywhere.

If lint fails due to pre-existing issues unrelated to the change:
- Do not widen the scope unnecessarily.
- Still ensure **no new lint issues** are added, and keep changed files clean.

## Code style (TypeScript + React)
- **TypeScript-first**. No new JS files unless the repo already uses them.
- Avoid `any`. Prefer generics, unions, type inference, and well-named domain types.
- Prefer `const`, pure functions, and small modules.
- Keep functions/components short and single-purpose.
- Use explicit return types for exported functions when it improves clarity.
- Avoid `eslint-disable` and `ts-ignore`. If absolutely necessary, add a short explanation comment.

### Naming & structure
- Components: `PascalCase` (e.g., `UserCard.tsx`)
- Hooks: `useSomething`
- Utilities: `camelCase`, grouped by domain (not “utils” dumping ground)
- Prefer `@/` absolute imports (configured via `tsconfig.json`)

## Next.js best practices
### Routing & rendering
- Use the **App Router** (`app/`) conventions.
- Prefer **Server Components by default**. Add `"use client"` only when needed
  (state, effects, browser-only APIs, event handlers).
- Keep data fetching **on the server** when possible (Server Components, Route Handlers, Server Actions).
- Avoid leaking server-only code into the client bundle.

### Data fetching & caching
- Use `fetch` on the server and be explicit about caching semantics:
  - `cache: "no-store"` for truly dynamic data
  - `revalidate` where appropriate
- Keep request logic in `src/lib/` (or existing `lib/` location), not scattered across components.

### UI & performance
- Use `next/image` for images and `next/link` for navigation.
- Prefer composition over prop drilling; use context sparingly and locally.
- Avoid large client dependencies; consider `next/dynamic` for heavy client-only widgets.
- Always consider accessibility: semantic HTML, labels, focus states, keyboard navigation.

### Server boundaries & env vars
- Never access secrets in client components.
- Client-exposed variables must be prefixed with `NEXT_PUBLIC_`.
- Prefer validating env at startup (e.g., with `zod`) in a single place (`src/lib/env.ts`).

## API Development Best Practices
### Route Handler Structure
- **Organize by domain**: Group related routes in feature folders (e.g., `app/api/videos/`, `app/api/auth/`)
- **Consistent naming**: Use RESTful conventions with plural nouns
- **HTTP methods**: Use appropriate HTTP verbs (GET, POST, PUT, DELETE)
- **Route handlers**: Prefer named exports over default exports

### API Route Patterns
```ts
// app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth.server';

const createVideoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000),
  tags: z.array(z.string()).max(15),
});

// GET /api/videos - List videos
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, createdAt: true },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create video
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createVideoSchema.parse(body);

    const video = await prisma.video.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
      select: { id: true, title: true, createdAt: true },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Best Practices
- **Input validation**: Always validate inputs with Zod schemas at route boundaries
- **Authentication**: Check authentication/authorization at the start of protected routes
- **Error handling**: Use try-catch blocks and return appropriate HTTP status codes
- **Response consistency**: Standardize response formats (success/error structures)
- **Selective data**: Use Prisma `select` to return only needed fields
- **Pagination**: Implement cursor-based pagination for list endpoints
- **Rate limiting**: Consider implementing rate limiting for public APIs
- **Logging**: Log errors and important events for debugging
- **Documentation**: Document API endpoints with JSDoc comments


## Prisma ORM (backend) conventions
### Placement & boundaries
- Prisma code is **server-only**. Never import Prisma Client from Client Components.
- Centralize DB access in a single module, e.g. `src/server/db/prisma.ts` (or `src/lib/db/prisma.ts`).
- Prefer a small **data-access layer** (repositories/services) instead of calling Prisma directly from UI components.

### Prisma Client instantiation (Next.js)
- Use a singleton pattern in development to avoid creating many clients during HMR:

  ```ts
  // src/server/db/prisma.ts
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      // log: ["error", "warn"], // enable if useful
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

- Default to Node.js runtime for DB routes/actions. If using Edge, ensure your Prisma setup supports it
  (e.g., Data Proxy / Accelerate) and document the choice.

### Schema & migrations
- Keep the schema readable and intentional:
  - Use explicit relation names when helpful.
  - Add indexes for frequently filtered/sorted columns.
  - Use enums for constrained domains.
- Prefer migrations:
  - Local/dev: `prisma migrate dev`
  - Prod/CI: `prisma migrate deploy`
- Avoid `prisma db push` except for prototypes.
- After editing `schema.prisma`:
  - Run `prisma format`
  - Ensure generation happens (`prisma generate`, often via `postinstall`)

### Query patterns & performance
- Always limit data returned:
  - Prefer `select` over returning whole models.
  - Use `include` deliberately; avoid accidental overfetching.
- Guard against N+1 queries:
  - Fetch related data with a single query where appropriate.
  - Consider batching patterns if needed.
- Use pagination for collections:
  - Prefer cursor pagination for large datasets.
- Use transactions for multi-step writes:
  - `await prisma.$transaction([...])` for independent ops
  - `await prisma.$transaction(async (tx) => { ... })` for dependent ops

### Safety & correctness
- Validate inputs before DB writes (e.g., `zod`) and keep validation close to the boundary (route/action).
- Avoid `$queryRaw`. If unavoidable, use parameterized forms (`$queryRaw` tagged template) and document why.
- Handle unique constraints and expected errors explicitly (don’t leak internals in responses).
- Keep timestamps/soft-delete conventions consistent (if used, codify in one place and reuse helpers).

### Testing & local DX
- Prefer deterministic seeds for local/dev.
- For integration tests:
  - Use a dedicated test DB or schema
  - Reset state via migrations or a clean strategy (documented in `README`)

## Testing with Playwright
### E2E Testing Requirements
- **Playwright is mandatory** for testing critical user flows and UI interactions
- Write E2E tests for all user journeys: authentication, form submissions, navigation flows
- Test across multiple browsers and devices using Playwright's built-in capabilities

### Playwright Setup
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Generate test file
npx playwright codegen localhost:3000
```

### Playwright Commands
Common commands (replace `<pm>` with pnpm/yarn/npm):
- Install browsers: `<pm> exec playwright install`
- Run tests: `<pm> run test:e2e`
- Run with UI: `<pm> run test:e2e:ui`
- Debug mode: `<pm> run test:e2e --debug`
- Generate test: `<pm> run test:e2e:codegen`
- Show report: `<pm> run test:e2e:report`

### Playwright Best Practices
- **Data attributes for selectors**: Use `data-testid` attributes instead of CSS selectors
- **Page Object Model**: Create page objects for reusable page interactions
- **Authentication helpers**: Set up auth state for tests that require login
- **Visual regression**: Use Playwright's screenshot capabilities for visual testing
- **API mocking**: Mock external APIs when testing UI flows
- **Parallel execution**: Tests run in parallel by default for speed
- **CI integration**: Tests run headless in CI environments

### Test File Structure
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── video-generation.spec.ts
│   └── navigation.spec.ts
├── fixtures/
│   └── test-data.ts
└── page-objects/
    ├── BasePage.ts
    ├── LoginPage.ts
    └── VideoPage.ts
```

### Test Coverage Requirements
- **Unit tests**: Pure functions, utilities, and business logic
- **Component tests**: UI component behavior and interactions (React Testing Library)
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Critical user flows and end-to-end scenarios with Playwright
- **Minimum coverage**: 80% for new features, maintain existing coverage levels

## Styling: keep design in one place (easy redesign)
**Goal:** You should be able to re-theme / redesign the UI by changing a small number of files.

### Single source of truth for design tokens
- Put all **design tokens** (colors, radii, shadows, spacing scale, typography variables)
  in **one place**:
  - Recommended: `src/styles/tokens.css` (CSS variables) and `tailwind.config.ts` mapping
  - Or follow the repo’s existing pattern, but keep tokens centralized.

### Rules for styling
- Do **not** hardcode hex colors in components.
- Avoid ad-hoc pixel values for spacing/typography when a token/scale exists.
- Prefer **semantic tokens** (e.g., `bg-background`, `text-foreground`, `border-border`)
  rather than raw colors.
- Global base styles only in `src/styles/globals.css` (or `app/globals.css` if that’s the convention).
- Component variants should be centralized (e.g., CVA/variant utilities) rather than duplicated class strings.

### Component styling guidance
- No inline `style={{ ... }}` unless there is a strong, documented reason.
- Keep component classNames readable:
  - Extract long, repeated class strings into a `styles` object or variant helper.
  - Prefer `clsx`/`cn` helper (whatever the repo already uses).

### Atomic Component Development
- **Props-first approach**: All components accept typed props for customization
- **Variant patterns**: Use libraries like `class-variance-authority` (CVA) for component variants
- **Type-safe props**: Define strict prop interfaces with proper defaults
- **Composition patterns**: Design components to work together through composition
- **Accessibility built-in**: Include ARIA attributes, focus management, and keyboard navigation
- **Responsive by default**: Components should work across all screen sizes
- **Theme-aware**: Use design tokens for colors, spacing, and typography

### Component Examples
```tsx
// src/components/atoms/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Usage in molecules/organisms
import { Button } from '@/components/atoms/Button';

export const FormActions = ({ onCancel, onSubmit, loading }) => (
  <div className="flex gap-2">
    <Button variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button onClick={onSubmit} disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </Button>
  </div>
);
```

## Quality checklist for every change
- ✅ Lint passes: `<pm> run lint`
- ✅ Types are sound (and typecheck passes if available)
- ✅ UI changes follow token-based styling (no scattered redesign work)
- ✅ Accessibility not regressed (labels, focus, semantics)
- ✅ No unused exports, dead code, or debug logs
- ✅ **Components in correct location**: All reusable components in `src/components/` with atomic structure
- ✅ **Constants centralized**: All shared constants moved to `src/constants/` in structured files
- ✅ **Atomic component principles**: Components built with typed props, variants, and composition
- ✅ **Playwright coverage**: E2E tests added for new user flows (if applicable)
- ✅ **Test coverage maintained**: Unit/component tests added for new logic
- ✅ **API standards**: Route handlers follow validation, error handling, and response patterns

## Commit message guidelines
- **Keep commit messages short and concise**
- **Include Functional Requirements (FR)**: When user inputs contain functional requirements marked with `FR`, include them in the commit message
- Example: `feat: Add video metadata form (FR: Support YouTube metadata generation)`
- Use conventional commit format when applicable (feat, fix, refactor, docs, etc.)

## When unsure
- Follow existing patterns in the repo.
- Choose the simplest solution that keeps server/client boundaries clear.
- If you must introduce a new dependency, prefer small, well-maintained libraries and justify it in the PR/task notes.
