# AGENTS.md

## Language

This project uses **Vietnamese** for all user-facing text (UI labels, messages, page content).

## Project overview

React Router 7 full-stack SSR dashboard for scraped Google Maps businesses. Neon Postgres, Drizzle ORM, Better Auth (Google OAuth, invite-only), TailwindCSS v4.

## Commands

```bash
pnpm run dev            # HMR dev server on :5173
pnpm run build          # production build → build/client + build/server
pnpm run start          # serve production build
pnpm run typecheck      # react-router typegen → tsc (order matters)
pnpm run test           # run all tests (vitest run)
pnpm run test:watch     # run tests in watch mode
pnpm run migrate        # run database migration script (uses --env-file=.env)
pnpm run db:studio      # open Drizzle Kit studio
pnpm run format         # format all files with Prettier
```

## Structure Layout & Naming Conventions

Module/Feature separation with Clean Architecture (Presentation separated from Business Logic). Import alias: `~/*` → `./app/*`.

### 📂 Directory Layout

```
app/
  features/[feature-name]/           # Each domain/feature is a separate folder
    components/                      # Feature UI components → @ui works here
    hooks/                           # Custom hooks (state, validation, fetch) → @logic works here
  shared/                            # Shared code across the project
    components/                      # Design system (atoms, molecules, organisms) → @ui works here
    icons/                           # SVG icon components
    hooks/                           # Shared hooks (theme, click-outside, keyboard nav)
    layouts/                         # App shell (sidebar, breadcrumbs)
    constants/                       # Shared constants (barrel export)
    types/                           # Shared types (barrel export)
    utils/                           # Shared utilities (barrel export)
  server/                            # Server-only code → @logic works here
    auth/                            # Better Auth setup + session guard
    database/                        # Drizzle ORM schema + query modules per domain
    http/                            # CSRF, request validation helpers
  routes/                            # Route modules (self-contained: loader + action + meta + component)
    routes.ts                        # Central route config
    *.tsx / *.ts                     # Page routes + API endpoints
tests/                               # Mirror source structure (features/, shared/)
```

## Multi-Agent Workflow

### 1. Delegation Rules

When receiving a request from the user, the main Agent (`Build` or `Plan`) must not write all code end-to-end in a generic way. Decompose the task and delegate to subagents according to these boundaries:

- **UI & Style:** Layout, components, CSS/Tailwind, responsive design → `@ui`.
- **Logic & Data (State/API):** Custom Hooks, API calls, state management, loader/action handling, form validation → `@logic`.
- **Performance/SEO:** Page optimization, re-render fixes, SEO improvements → `@perf`.
- **Testing:** When a feature or logic module is complete, or when tests are requested → `@tester`.

### 2. Feature Development Workflow

To prevent code conflicts and maintain clean structure, Agents must follow this 3-step workflow when developing a new feature:

1. **Step 1 (Analysis):** Agent `Plan` receives the overall request, analyzes the architecture of files to create/modify, and maps the data flow.
2. **Step 2 (UI Implementation):** Activate `@ui` to build the skeleton, layout, and pure display components with mock data.
3. **Step 3 (Logic Integration):** Activate `@logic` to extract mock data, replace with Custom Hooks, connect to real loaders/actions, and handle Loading/Error states.

### 3. Project Code Standards

All Agents and Subagents must strictly follow these technical standards when generating or editing code:

- **Architecture:** Strictly separate Presentation from Business Logic. Never write API calls directly inside UI components.
- **Error handling:** Never assume loaders/actions always return correct results. Always catch errors and display fallback UI (prevent app crashes).
- **Absolutely forbidden:** Never install new npm dependencies without explicit user confirmation.

### 🏷 Naming Conventions

1. **UI Components:** kebab-case (e.g. `business-card.tsx`, `filter-bar.tsx`)
2. **Custom Hooks:** `use` prefix + kebab-case (e.g. `use-click-outside.ts`, `use-theme.ts`)
3. **Logic/Service/Types/Constants files:** kebab-case + `.ts` (e.g. `businesses.server.ts`, `business.ts`, `businesses.constant.ts`)
4. **Route modules:** kebab-case, `.` separates params (e.g. `businesses.$id.tsx`, `api.businesses.$id.notes.ts`)
5. **Server files:** suffix `.server.ts` — only import from route modules or other server files

### ❌ Architectural Constraints

- **No Logic in UI:** Components in `components/` only receive data from props or custom hooks. Never write `fetch()`, `db.select()` directly in components.
- **No cross-feature imports:** Files in `app/features/dashboard/` must not import directly from `app/features/business-detail/`. If shared → move to `app/shared/` or pass through route loader.
- **No server code in client:** `*.server.ts` files are only imported from route modules or other server files.
- **Helper functions:** Never define helpers inside component files. Shared helpers → `app/shared/utils/`. Server code → `app/server/`. Constants → `app/shared/constants/`. Types → `app/shared/types/`.

### 📦 Import & Export Conventions

- **Named imports** — no `import * as React`. No unnecessary `forwardRef` on presentational leaf components.
- **Barrel exports** at each feature's `components/index.ts`, `hooks/index.ts`, and `shared/*/index.ts`. Server modules imported directly by path (no barrel).
- **Route types**: Route modules use types from `./+types/<filename>` (React Router 7 typegen).
- **ROUTES constant**: Use `ROUTES.<route>.path` and `ROUTES.<route>.buildPath()` for all navigation instead of hardcoded strings.

## Features

- **Dashboard filter**: Search input + status select + ward multi-select (grouped by district via `GroupedSelectCheckbox`) + "Lọc" submit button. Filters are URL-driven (`?search=&status=&wardId=&page=`), form uses local state and pushes to URL on submit only. Server-side pagination via `page`/`limit` params.
- **Status pipeline**: new → approached → contacted → qualified → rejected. Updated via `<StatusCard>` with optimistic UI. Terminal when rejected.
- **Notes per business**: Multiple notes with author + relative timestamps. Enter-to-submit. Supports create, update, and soft delete. PATCH/DELETE enforce ownership (only note author can edit/delete). Returns full list after insert for instant sync.
- **Zalo button**: Formats VN phone (098… → 8498…) and opens `https://zalo.me/p/…` in new tab.
- **Invite management**: `/invite` route provides web UI to add emails to the invite list (previously CLI-only via `pnpm invite`).
- **Ward-based filtering**: Districts and wards loaded in dashboard loader. `BusinessFilter` supports `wardId` (single or multi-select). `groupDistrictsWithWards` utility groups query results for the `GroupedSelectCheckbox` component.

## Database schema (Drizzle ORM)

Schema defined in `app/server/database/schema.server.ts`. Query modules in `app/server/database/*.server.ts`.

| Table / View              | Notes                                                                         |
| ------------------------- | ----------------------------------------------------------------------------- |
| `user`                    | Better Auth — id, name, email, emailVerified, image, createdAt, updatedAt     |
| `session`                 | Better Auth — id, expiresAt, token, userId (FK → user), ipAddress, userAgent  |
| `account`                 | Better Auth — OAuth accounts with tokens                                      |
| `verification`            | Better Auth — email verification tokens                                       |
| `districts`               | id (serial PK), name (unique)                                                 |
| `wards`                   | id (serial PK), name, district_id (FK → districts), unique(name, district_id) |
| `businesses`              | Scraped business data + status + ward_id (FK → wards) + is_corrected          |
| `scrape_runs`             | Scrape job tracking — keyword, counts, duration, errors, status               |
| `business_notes`          | business_id FK, content, created_by, created_at, deleted_at (soft delete)     |
| `user_invites`            | email (unique) + invited_at                                                   |
| `v_businesses_classified` | Read-only SQL view joining businesses with wards + districts                  |

## Testing

- **Framework**: Vitest + @testing-library/react + @testing-library/jest-dom + jsdom
- **Config**: `vitest.config.ts` — jsdom environment, globals enabled, CSS enabled, v8 coverage
- **Setup**: `tests/setup.ts` — imports jest-dom matchers, mocks `scrollIntoView`
- **Structure**: Tests mirror source structure under `tests/` (features/, shared/)
- **Run**: `pnpm run test` (single run) or `pnpm run test:watch` (watch mode)
- **Coverage**: `@vitest/coverage-v8` provider

## CI/CD

- **GitHub Actions**: `.github/workflows/docker-publish.yml`
- **Pipeline**: Test + typecheck job → Docker build + push to GHCR on push to master
- **Docker**: Multi-stage Node 22 Alpine build with pnpm, runs `react-router-serve` on port 3000
- **Tags**: branch name, semver, commit SHA, `latest`

## Gotchas

- `typecheck` runs `react-router typegen` first, which generates `.react-router/types/`. If typecheck fails, try running `pnpm run dev` once to populate the types.
- `*.server.ts` files are server-only. Don't import them in client components. Import directly from sub-paths (e.g. `~/server/database/businesses.server`).
- Auth uses React Router 7 middleware (`export const middleware`) with `createContext`. Loaders/actions access the session via `context.get(sessionContext)`, not from loader args.
- PostgreSQL `numeric`/`float` columns may arrive as strings from the Neon driver — use `Number()` before `.toFixed()`.
- `<fetcher.Form method="patch">` sends URL-encoded data, not JSON. Use `request.formData()` in actions.
- **`tsx` does NOT auto-load `.env`**: Scripts run via `npx tsx` (like `pnpm invite`, `pnpm migrate`) must include `--env-file=.env` flag. Vite/React Router dev server loads `.env` automatically.
- `FilterBar` uses local state for form fields — only pushes to URL search params on submit (the "Lọc" button). This means external URL manipulation (e.g. back/forward) won't sync with the form until submit.
- Notes use soft delete (`deleted_at` timestamp). Queries should filter out soft-deleted notes. PATCH/DELETE enforce ownership — only the note author can modify.
- Drizzle schema uses `casing: "camelCase"` — Postgres columns are snake_case but accessed as camelCase in TypeScript.
- `.env` must contain `NEON_DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## Rate limiting

Rate limiting is not implemented in application code. Recommended approaches:

- **Cloudflare**: Use WAF rate limiting rules (preferred for production)
- **Nginx**: `limit_req_zone` + `limit_req` directives (if self-hosted)
- Apply to mutation endpoints: `/api/businesses/:id/notes`, `/api/businesses/:id/status`, `/invite`
