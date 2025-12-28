# AGENTS.md — Codex project instructions (Next.js)

## Goals
- Keep the codebase **predictable, maintainable, and easy to redesign**.
- Prefer **boring, proven patterns** over cleverness.
- Optimize for **readability, type-safety, accessibility, and performance**.

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

## Quality checklist for every change
- ✅ Lint passes: `<pm> run lint`
- ✅ Types are sound (and typecheck passes if available)
- ✅ UI changes follow token-based styling (no scattered redesign work)
- ✅ Accessibility not regressed (labels, focus, semantics)
- ✅ No unused exports, dead code, or debug logs

## When unsure
- Follow existing patterns in the repo.
- Choose the simplest solution that keeps server/client boundaries clear.
- If you must introduce a new dependency, prefer small, well-maintained libraries and justify it in the PR/task notes.
