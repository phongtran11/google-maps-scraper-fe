# AGENTS.md

## Language & Stack

- **Language**: Vietnamese for all user-facing text.
- **Stack**: React Router 7 (SSR), Neon Postgres + Drizzle ORM (camelCase casing), Better Auth, TailwindCSS v4, Vitest, pnpm.

## Directory Layout & Conventions

Import alias: `~/*` → `./app/*`.

### 📂 Architecture

- `app/features/[feature-name]/`: Clean Architecture. Presentation separated from Logic.
  - `queries.server.ts` / `mutations.server.ts`: Server-only data operations.
  - `components/`, `hooks/`, `constants.ts`
  - `index.ts`: Barrel export for components + constants ONLY.
- `app/shared/`: Global design system, utils, hooks, types.
- `app/server/`: Auth setup, DB schema, global server-helpers.
- `app/routes/`: Route modules (centralized via `routes.ts`).

### 🏷 Naming

1. UI Components / Routes / Hooks: kebab-case (e.g., `business-card.tsx`, `use-theme.ts`).
2. Server files: Suffix `.server.ts`.
3. Types: Always use `type` instead of `interface` for consistency.

### ❌ Architectural Constraints (STRICT)

- **No Logic in UI**: Components only receive data via props or hooks. No direct `fetch()` or `db.select()`.
- **No cross-feature imports**: Features must not import from each other. Move to `shared/` if needed.
- **No server code in client**: Use `import type` when client components need types from `*.server.ts`.
- **No standalone `types.ts` in features**: Domain/Query types live inside `queries.server.ts` or `mutations.server.ts` using `AwaitedReturn`.
- **No helper definitions inside component files**.

## Query & Mutation Patterns

- **Strict ID Typing**: All ID params in queries/mutations MUST be `number`. The caller (route/action) is responsible for parsing via `parseId()`.
- **No `SELECT *`**: Always define explicit column schemas at the module level and select only needed columns.
- **Export Result Types**: Always export query/mutation return types using `AwaitedReturn<typeof fn>`.

## Core Business Rules

- **Status Pipeline**: new → approached → contacted → qualified → rejected. (Optimistic UI required).
- **Notes**: Supports soft-delete (`deleted_at`). PATCH/DELETE must enforce author ownership.
- **Zalo Integration**: Phone numbers must be formatted from `098...` to `8498...` before opening `https://zalo.me/p/...`.
- **Navigation**: Use `ROUTES.<route>.path` or `buildPath()`, never hardcode URLs.

## Critical Gotchas & Workarounds

- **Typegen**: Run `pnpm run dev` first if `.react-router/types/` is missing during typecheck.
- **Auth**: Access session via `context.get(sessionContext)` inside loaders/actions (React Router 7 middleware), NOT from loader args.
- **Data Types**: Neon/PostgreSQL `numeric` columns return as strings. Wrap in `Number()` before mutations/formatting.
- **Forms**: `<fetcher.Form method="patch">` sends URL-encoded data. Use `request.formData()`.
- **Scripts**: External TSX scripts (migrations, seeds) do NOT auto-load `.env`. Must append `--env-file=.env`.
