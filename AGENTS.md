# AGENTS.md

## Language

This project uses **Vietnamese** for all user-facing text (UI labels, messages, page content).

## Project overview

React Router 7 full-stack SSR dashboard for scraped Google Maps businesses. Neon Postgres, Better Auth (Google OAuth, invite-only), TailwindCSS v4.

## Commands

```bash
pnpm run dev            # HMR dev server on :5173
pnpm run build          # production build → build/client + build/server
pnpm run start          # serve production build
pnpm run typecheck      # react-router typegen → tsc (order matters)
pnpm run generate-types # regenerate app/types/database.ts from Neon schema
pnpm run invite <email> # invite a user (adds to user_invites table)
```

## Architecture

```
app/
  lib/
    auth.server.ts      # Better Auth instance (Neon Pool, Google OAuth, invite hook)
    auth-client.ts      # Client-side Better Auth React client
    require-auth.ts     # Server guard: checks session + user_invites
    db.server.ts        # Neon Pool + setupDatabase (auto-migrates)
    constants.ts        # STATUS_MAP, NEXT_STATUS, AREAS
    types.ts            # BusinessRow, NoteRow (shared across routes/components)
    format.ts           # relativeTime, formatZaloPhone
    utils.ts            # cn() helper (clsx + tailwind-merge)
  hooks/
    useInfiniteScroll.ts # IntersectionObserver + useFetcher for cursor pagination
    useNotesManager.ts   # Notes form ref + submission via fetcher
  components/
    atoms/              # Button, Input, Badge, RatingBadge, Field
    molecules/          # Card, Alert, Toast, Dialog, BusinessCard
    organisms/          # Table, StatusCard, NotesSection, BusinessSidebar, BusinessDetails, ReviewImages
    icons/              # Spinner, Google, ChevronLeft, ExternalLink
    README.md           # Component conventions + design token contract
  routes/
    routes.ts           # Central route config (layout + index + route helpers)
    root.tsx            # ToastProvider wrapper
    login.tsx            # Google sign-in page with invite error display
    app-layout.tsx       # Protected layout (auth guard + header + sign-out)
    dashboard.tsx        # Infinite-scroll business grid + area filter chips
    businesses.$id.tsx   # Business detail (details, images, notes, status, Zalo)
    api.auth.$.ts        # Better Auth catch-all handler
    api.businesses.ts    # GET paginated businesses (offset/limit/area)
    api.businesses.$id.notes.ts    # GET notes, POST add note
    api.businesses.$id.status.ts   # PATCH update business status
```

- **Route config**: `app/routes.ts` uses `@react-router/dev/routes` helpers (`index`, `route`, `layout`).
- **Import alias**: `~/*` → `./app/*`
- **Auth**: `app/lib/auth.server.ts` sets up Better Auth with Neon Pool. `app/lib/require-auth.ts` checks session + `user_invites` table on every protected request. The `app-layout` layout applies this guard to all nested routes.
- **DB**: Direct SQL via `@neondatabase/serverless` `pool.query()` in loaders/actions. No ORM. `setupDatabase()` auto-creates `user_invites` + `business_notes` tables and adds `status` column on first session attempt.
- **Generated types**: `.react-router/types/` (auto, don't edit). `app/types/database.ts` (regenerate manually after schema changes).

## Features

- **Area filter**: 4 hardcoded areas (Ngãi Giao, Suối Nghệ, Nghĩa Thành, Bình Giã) as URL-driven filter chips. Persists across infinite scroll loads.
- **Status pipeline**: new → approached → contacted → qualified → rejected. Updated via `<StatusCard>` with optimistic UI. Terminal when rejected.
- **Notes per business**: Multiple notes with author + relative timestamps. Enter-to-submit. Returns full list after insert for instant sync.
- **Zalo button**: Formats VN phone (098… → 8498…) and opens `https://zalo.me/p/…` in new tab.
- **Auto-migration**: `setupDatabase()` in `db.server.ts` runs on first session creation. Creates tables/columns with `IF NOT EXISTS`.

## Key conventions

- **Components** follow atomic design: `atoms/`, `molecules/`, `organisms/`. See `app/components/README.md`.
- **Custom hooks** live in `app/hooks/` — encapsulate fetcher + DOM observer + form logic. Export via barrel `app/hooks/index.ts`.
- **Shared constants/types** in `app/lib/` — no duplicated STATUS_MAP or BusinessRow across files.
- **Named imports** — no `import * as React`. No unnecessary `forwardRef` on presentational leaf components.
- **Barrel exports** at each layer index (`atoms/index.ts`, `molecules/index.ts`, `organisms/index.ts`, `components/index.ts`).
- **Auth routes**: `/login` (Google OAuth UI), `/api/auth/*` (Better Auth handler). Protected routes under `routes/app-layout` layout.
- **Pagination**: `app/hooks/useInfiniteScroll` wraps `IntersectionObserver` + `useFetcher` hitting `/api/businesses?offset=&limit=&area=`. Supports `resetKey` to discard stale fetcher data on filter change.
- **Optimistic UI**: StatusCard submitts via `<fetcher.Form>` — shows new status immediately from `formData.get("status")`.

## Database schema (auto-managed)

| Table | Created by | Notes |
|---|---|---|
| `user`, `session`, `account`, `verification` | Better Auth adapter | Auto-migrated on first `betterAuth()` call |
| `user_invites` | `setupDatabase()` | email (unique) + invited_at |
| `business_notes` | `setupDatabase()` | business_id FK, content, created_by, created_at |
| `businesses.status` | `setupDatabase()` | ALTER TABLE adds column if missing, default 'new' |

## Gotchas

- `typecheck` runs `react-router typegen` first, which generates `.react-router/types/`. If typecheck fails, try running `pnpm run dev` once to populate the types.
- `*.server.ts` files are server-only. Don't import them in client components.
- `useRouteLoaderData` accesses parent layout data in child routes (dashboard reads user from app-layout).
- PostgreSQL `numeric`/`float` columns may arrive as strings from the Neon driver — use `Number()` or `toNum()` before `.toFixed()`.
- `<fetcher.Form method="patch">` sends URL-encoded data, not JSON. Use `request.formData()` in actions.
- `useInfiniteScroll` tracks `resetKey` — pass the current area filter so stale data is discarded on area change.
- `.env` must contain `NEON_DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
