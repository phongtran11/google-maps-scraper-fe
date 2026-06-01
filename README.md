# Google Maps Scraper Dashboard

React Router 7 full-stack dashboard for scraped Google Maps businesses. Browse, filter, manage status pipeline, and take notes on each business.

## Tech Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Framework       | React Router 7 (SSR)                    |
| Database        | Neon Serverless Postgres                |
| Auth            | Better Auth (Google OAuth, invite-only) |
| Styling         | TailwindCSS v4                          |
| Package manager | pnpm                                    |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm
- Neon database
- Google OAuth credentials

### Installation

```bash
pnpm install
```

### Environment Variables

Create `.env`:

```env
NEON_DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
BETTER_AUTH_SECRET="64-char-random-secret"
BETTER_AUTH_URL="http://localhost:5173"
```

Generate `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 48
```

### Development

```bash
pnpm run dev
```

App available at `http://localhost:5173`.

### Invite your first user

```bash
pnpm invite your.email@gmail.com
```

> The `invite` script uses `tsx --env-file=.env` to load environment variables from `.env` (Vite dev server does this automatically, but `tsx` does not).

Then visit `http://localhost:5173/login` and sign in with Google.

### Generate types

After schema changes (new tables, columns):

```bash
pnpm generate-types
```

### Typecheck

```bash
pnpm run typecheck
```

## Features

### Business Dashboard (`/`)

- **Table view** — business name, phone, address, status badge, action buttons (Chi tiết, Zalo, Maps)
- **Filter bar** — search by name, filter by status (Mới → Từ chối), filter by area (Ngãi Giao, Suối Nghệ, Nghĩa Thành, Bình Giã) with submit button
- **Server-side pagination** — page/limit URL params, pagination controls with page numbers + prev/next
- **Empty state** — contextual message when no businesses match filters

### Business Detail (`/businesses/:id`)

- **Details card** — all fields (name, category, address, phone, region, keyword, timestamps)
- **Status pipeline** — change status with one click, optimistic UI, terminal when rejected
- **Notes** — multiple notes per business with author, relative timestamps, Enter-to-submit
- **Zalo button** — auto-formats VN phone numbers and opens Zalo deep link
- **Google Maps link** — opens external Maps page
- **Review images** — grid of scraped review photos

### Authentication

- **Google OAuth** only — no email/password
- **Invite-only** — only emails in `user_invites` table can log in
- **Instant revocation** — checked on every login + every request

### Status Pipeline

```
Mới ──→ Đã tiếp cận ──→ Đã liên hệ ──→ Tiềm năng
  │          │              │              │
  └──→ Từ chối ────────────┘              │
                   └──→ Từ chối ───────────┘
```

### Phone Formatting (Zalo)

| Input          | Output                          |
| -------------- | ------------------------------- |
| `0987654321`   | `https://zalo.me/p/84987654321` |
| `+84987654321` | `https://zalo.me/p/84987654321` |
| `84987654321`  | `https://zalo.me/p/84987654321` |

## Architecture

```
app/
  features/
    dashboard/          # Dashboard route, API, components (table, filters)
    business-detail/    # Business detail route, APIs, components, hooks
    auth/               # Login route + Better Auth API handler
    layout/             # App-layout route, sidebar, breadcrumbs
  shared/
    components/         # Design system: Button, Input, Badge, Card, Table, Dialog, etc.
    icons/              # SVG icon components (15 icons)
    hooks/              # useTheme
    lib/                # pagination utility
  lib/                  # Shared infra: auth, db, constants, types, format, utils, csrf
  routes/               # Thin re-exports (1 line/file) → delegates to features/
  routes.ts             # Central route config
  root.tsx              # ToastProvider wrapper + dark mode script
```

## Database

### Querying

```ts
import { sql } from "~/lib/server/db.server";

// Returns a flat array of row objects directly
const result = await sql.query(
  `SELECT * FROM businesses WHERE address ILIKE $1 ORDER BY created_at DESC LIMIT $2`,
  [`%Ngãi Giao%`, 20],
);
```

### Generated types

```ts
import type { Tables } from "~/types/database";

type Business = Tables<"businesses">;
```

### Tables

| Table                                        | Purpose                    |
| -------------------------------------------- | -------------------------- |
| `businesses`                                 | Scraped business listings  |
| `scrape_runs`                                | Scraping job history       |
| `business_notes`                             | Notes per business         |
| `user_invites`                               | Allowed email list         |
| `user`, `session`, `account`, `verification` | Better Auth (auto-managed) |

---

## Production Checklist

### Pre-deployment

- [ ] **Environment variables** — Set all 5 vars in production environment (`NEON_DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- [ ] **BETTER_AUTH_URL** — Set to your production domain (e.g., `https://dashboard.example.com`)
- [ ] **Google OAuth redirect URIs** — Add production domain to Google Cloud Console (`https://dashboard.example.com/api/auth/callback/google`)
- [ ] **BETTER_AUTH_SECRET** — Generate a strong random secret (`openssl rand -base64 48`), do NOT reuse dev secret
- [ ] **Neon database** — Ensure production project has the schema (run `pnpm run db:migrate` in the `google-maps-scraper` backend directory against the production database to execute the schema migrations)
- [ ] **Invite users** — `pnpm invite admin@example.com` against production `NEON_DATABASE_URL`
- [ ] **Typecheck passes** — `pnpm run typecheck` with zero errors
- [ ] **Build succeeds** — `pnpm run build` completes without errors

### Post-deployment

- [ ] **Login flow** — Visit `/login`, sign in with invited Google account, verify redirect to dashboard
- [ ] **Invite rejection** — Sign in with a non-invited Google account, verify error message
- [ ] **Filter bar** — Select area and status, click "Lọc", verify URL updates and results filter
- [ ] **Pagination** — Navigate between pages, verify URL updates and correct data loads
- [ ] **Search** — Type business name and submit, verify results filter
- [ ] **Business detail** — Click a business row, verify detail page loads with all fields
- [ ] **Status change** — Change status via buttons, verify optimistic update and persistence
- [ ] **Notes** — Add a note, verify it appears in list with correct timestamp and author
- [ ] **Zalo button** — Click Zalo button, verify it opens correct deep link with formatted phone
- [ ] **Google Maps** — Click Maps link, verify external page opens
- [ ] **Sign out** — Click Sign Out, verify redirect to `/login`
- [ ] **Session persistence** — Refresh the page, verify session survives
- [ ] **Revocation** — Remove an email from `user_invites`, refresh — verify redirect to `/login?error=unauthorized`

### Performance

- [ ] **Database queries** — All loaders use parameterized queries (`$1`, `$2`), no raw string concatenation
- [ ] **Bundle size** — Production build under 500 KB gzipped (per page)
- [ ] **Page load** — Dashboard loads < 2s on cold start
- [ ] **Images** — Review images use `loading="lazy"`, Cards use CSS lazy rendering

### Security

- [ ] **`.env` file** — NOT committed to git, NOT deployed as file (use platform env vars)
- [ ] **`BETTER_AUTH_SECRET`** — Different from dev, never shared
- [ ] **Google OAuth** — Redirect URIs restricted to production domain only
- [ ] **Neon connection** — `sslmode=require` in connection string
- [ ] **No secrets on client** — Environment variables only accessed in `*.server.ts` files
