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
pnpm run invite <email> # invite a user (adds to user_invites table; uses --env-file=.env)
```

## Architecture

```
app/
  features/
    dashboard/
      route.tsx               # loader + meta + component (real code)
      api.businesses.ts       # GET paginated businesses (offset/limit/area)
      components/
        dashboard-template.tsx # Dashboard page layout
        filter-bar.tsx         # Search input + status/area selects + Lọc button
        business-table.tsx     # Business list table with actions
        business-card.tsx      # Card variant (unused, kept for future)
        area-filter.tsx        # Chip-based area filter (unused, kept for future)
    business-detail/
      route.tsx               # loader + meta + component (real code)
      api.notes.ts            # GET notes, POST add note
      api.status.ts           # PATCH update business status
      components/
        business-details.tsx   # All field display
        business-sidebar.tsx   # Status + Zalo + Maps actions
        status-card.tsx        # Status pipeline selector with optimistic UI
        notes-section.tsx      # Notes list + add form
        review-images.tsx      # Scraped review photo grid
      hooks/
        useNotesManager.ts     # Notes form ref + submission via fetcher
        useInfiniteScroll.ts   # IntersectionObserver + useFetcher for cursor pagination
    auth/
      route.tsx               # Google sign-in page with invite error display
      api.auth.$.ts            # Better Auth catch-all handler
    layout/
      route.tsx               # Protected layout (auth guard + breadcrumbs + sign-out)
      breadcrumbs.ts           # getBreadcrumbs helper
      components/
        app-layout-template.tsx # Sidebar + breadcrumbs + content area
        admin-sidebar.tsx      # Navigation sidebar
        sidebar-nav-item.tsx   # Single nav link with icon
        sidebar-profile.tsx    # User avatar + theme toggle + sign-out
  shared/
    components/                # Design system primitives
      badge.tsx, button.tsx, input.tsx, select.tsx   # atoms
      field.tsx, rating-badge.tsx, theme-toggle.tsx  # atoms
      alert.tsx, card.tsx, dialog.tsx, toast.tsx     # molecules
      pagination.tsx, table.tsx                      # organisms (shared)
    icons/                    # 15 SVG icon components
    hooks/
      useTheme.ts             # Dark mode toggle hook
    lib/
      pagination.ts           # getPageNumbers utility
  lib/
    server/
      auth.server.ts          # Better Auth instance (Neon Pool, Google OAuth, invite hook)
      db.server.ts            # Neon Pool + setupDatabase (auto-migrates)
      require-auth.server.ts  # Server guard: checks session + user_invites
      csrf.server.ts          # Same-origin request verification
    auth-client.ts            # Client-side Better Auth React client
    constants.ts              # STATUS_MAP, NEXT_STATUS, AREAS, STATUS_FILTER_OPTIONS, AREA_FILTER_OPTIONS
    types.ts                  # BusinessRow, NoteRow (shared across routes/components)
    format.ts                 # relativeTime, formatZaloPhone
    utils.ts                  # cn() helper (clsx + tailwind-merge)
  routes/
    routes.ts                 # Central route config (layout + index + route helpers)
    root.tsx                  # ToastProvider wrapper + dark mode script
    login.tsx                 # 1-line re-export → features/auth/route
    app-layout.tsx            # 1-line re-export → features/layout/route
    dashboard.tsx             # 1-line re-export → features/dashboard/route
    businesses.$id.tsx        # 1-line re-export → features/business-detail/route
    api.auth.$.ts             # 1-line re-export → features/auth/api.auth.$
    api.businesses.ts         # 1-line re-export → features/dashboard/api.businesses
    api.businesses.$id.notes.ts    # 1-line re-export → features/business-detail/api.notes
    api.businesses.$id.status.ts   # 1-line re-export → features/business-detail/api.status
```

- **Route config**: `app/routes.ts` uses `@react-router/dev/routes` helpers (`index`, `route`, `layout`). References `routes/*` file paths (unchanged).
- **Thin re-exports**: Every file in `app/routes/` (except `routes.ts` and `root.tsx`) is a 1-line re-export to the real module in `app/features/`. This avoids `+types` import breakage when the route file path differs from the feature file path.
- **Import alias**: `~/*` → `./app/*`
- **Auth**: `app/lib/server/auth.server.ts` sets up Better Auth with Neon Pool. `app/lib/server/require-auth.server.ts` checks session + `user_invites` table on every protected request. The `app-layout` layout applies this guard to all nested routes.
- **DB**: Direct SQL via `@neondatabase/serverless` `pool.query()` in loaders/actions. No ORM. `setupDatabase()` auto-creates `user_invites` + `business_notes` tables and adds `status` column on first session attempt.
- **Generated types**: `.react-router/types/` (auto, don't edit). `app/types/database.ts` (regenerate manually after schema changes).

## Features

- **Dashboard filter**: Search input + 2 select dropdowns (status, area) + "Lọc" submit button. Filters are URL-driven (`?search=&status=&area=&page=`), form uses local state and pushes to URL on submit only. Server-side pagination via `page`/`limit` params.
- **Status pipeline**: new → approached → contacted → qualified → rejected. Updated via `<StatusCard>` with optimistic UI. Terminal when rejected.
- **Notes per business**: Multiple notes with author + relative timestamps. Enter-to-submit. Returns full list after insert for instant sync.
- **Zalo button**: Formats VN phone (098… → 8498…) and opens `https://zalo.me/p/…` in new tab.
- **Auto-migration**: `setupDatabase()` in `db.server.ts` runs on first session creation. Creates tables/columns with `IF NOT EXISTS`.

## Key conventions

- **Routes / Pages**: Files in `app/routes/` are thin re-exports only (1 line each). All real route logic (loaders, actions, meta, components) lives in `app/features/<domain>/route.tsx`.
- **Feature structure**: Each domain gets its own folder under `app/features/` — self-contained with its own `components/`, `hooks/`, and utility files. Only cross-cutting shared code goes to `app/shared/` or `app/lib/`.
- **Shared components**: Design system primitives live in `app/shared/components/`. This includes atoms (Button, Input, Badge, Select), molecules (Card, Dialog, Toast, Alert, Pagination), and the Table primitive.
- **Helper functions**: Never define standalone helper/utility functions inside component files. Shared helpers live in `app/lib/` (e.g. `constants.ts`, `format.ts`, `utils.ts`). Server-only library code lives in `app/lib/server/` (e.g. `auth.server.ts`, `db.server.ts`). Feature-specific helpers live in the feature folder (e.g. `features/layout/breadcrumbs.ts`).
- **Custom hooks**: Feature-specific hooks live in `features/<domain>/hooks/`. Shared hooks live in `shared/hooks/`. No barrel re-export needed if not imported outside the feature.
- **Shared constants/types** in `app/lib/` — no duplicated STATUS_MAP or BusinessRow across files.
- **Named imports** — no `import * as React`. No unnecessary `forwardRef` on presentational leaf components.
- **Barrel exports** at each feature's `components/index.ts` and `hooks/index.ts`, plus `shared/components/index.ts` and `shared/icons/index.ts`.
- **No `useCallback`**: Project uses React 19 but no React Compiler plugin. After refactoring, callbacks are either internal to the component or simple enough that memoization provides no benefit.
- **No `+types` imports**: Route modules use explicit types — `MetaFunction`, `LoaderFunctionArgs`, `ActionFunctionArgs` from `react-router`, and `useLoaderData<typeof loader>()` for typed component data. This works with the thin re-export pattern where the real module lives outside `routes/`.
- **Auth routes**: `/login` (Google OAuth UI), `/api/auth/*` (Better Auth handler). Protected routes under `routes/app-layout` layout.
- **Pagination**: Server-side with `page`/`limit` params in URL. `Pagination` component in `shared/components/` uses `getPageNumbers()` from `shared/lib/pagination.ts`.
- **Optimistic UI**: StatusCard submits via `<fetcher.Form>` — shows new status immediately from `formData.get("status")`.

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
- `useRouteLoaderData` accesses parent layout data. Currently `DashboardTemplate` in `features/dashboard/` calls it internally to get user info from the app-layout loader.
- PostgreSQL `numeric`/`float` columns may arrive as strings from the Neon driver — use `Number()` before `.toFixed()`.
- `<fetcher.Form method="patch">` sends URL-encoded data, not JSON. Use `request.formData()` in actions.
- **`tsx` does NOT auto-load `.env`**: Scripts run via `npx tsx` (like `pnpm invite`) must include `--env-file=.env` flag. Vite/React Router dev server loads `.env` automatically.
- `FilterBar` uses local state for form fields — only pushes to URL search params on submit (the "Lọc" button). This means external URL manipulation (e.g. back/forward) won't sync with the form until submit.
- `.env` must contain `NEON_DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
