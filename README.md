# Google Maps Scraper Dashboard

React Router 7 full-stack dashboard for scraped Google Maps businesses. Browse, filter, manage status pipeline, and take notes on each business.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Router 7 (SSR) |
| Database | Neon Serverless Postgres |
| Auth | Better Auth (Google OAuth, invite-only) |
| Styling | TailwindCSS v4 |
| Package manager | pnpm |

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

- **Responsive card grid** — business name, rating, category, address, phone, search keyword
- **Area filter chips** — Ngãi Giao, Suối Nghệ, Nghĩa Thành, Bình Giã; URL-driven, persists across pagination
- **Infinite scroll** — auto-loads 20 more businesses as you scroll
- **Status badge** — color-coded on each card (Mới / Đã tiếp cận / Đã liên hệ / Tiềm năng / Từ chối)
- **Count display** — "Hiển thị 20 doanh nghiệp tại Ngãi Giao trên tổng số 145"

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

| Input | Output |
|---|---|
| `0987654321` | `https://zalo.me/p/84987654321` |
| `+84987654321` | `https://zalo.me/p/84987654321` |
| `84987654321` | `https://zalo.me/p/84987654321` |

## Architecture

```
app/
  lib/               # auth, db, constants, types, format, utils
  hooks/             # useInfiniteScroll, useNotesManager
  components/
    atoms/           # Button, Input, Badge, RatingBadge, Field
    molecules/       # Card, Alert, Toast, Dialog, BusinessCard
    organisms/       # Table, StatusCard, NotesSection, BusinessSidebar, BusinessDetails, ReviewImages
    icons/           # Spinner, Google, ChevronLeft, ExternalLink
  routes/
    login.tsx        # Google sign-in
    app-layout.tsx   # Protected layout (auth guard + header)
    dashboard.tsx    # Business grid + filters + infinite scroll
    businesses.$id.tsx  # Business detail + status + notes + zalo
    api/
      auth.$.ts      # Better Auth handler
      businesses.ts  # GET paginated businesses
      businesses.$id.notes.ts   # GET/POST notes
      businesses.$id.status.ts  # PATCH status
```

## Database

### Querying

```ts
import { pool } from "~/lib/db.server";

const result = await pool.query(
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

| Table | Purpose |
|---|---|
| `businesses` | Scraped business listings |
| `scrape_runs` | Scraping job history |
| `business_notes` | Notes per business |
| `user_invites` | Allowed email list |
| `user`, `session`, `account`, `verification` | Better Auth (auto-managed) |

---

## Production Checklist

### Pre-deployment

- [ ] **Environment variables** — Set all 5 vars in production environment (`NEON_DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- [ ] **BETTER_AUTH_URL** — Set to your production domain (e.g., `https://dashboard.example.com`)
- [ ] **Google OAuth redirect URIs** — Add production domain to Google Cloud Console (`https://dashboard.example.com/api/auth/callback/google`)
- [ ] **BETTER_AUTH_SECRET** — Generate a strong random secret (`openssl rand -base64 48`), do NOT reuse dev secret
- [ ] **Neon database** — Ensure production project has the schema (run `pnpm run dev` locally against production DB once to trigger `setupDatabase()`)
- [ ] **Invite users** — `pnpm invite admin@example.com` against production `NEON_DATABASE_URL`
- [ ] **Typecheck passes** — `pnpm run typecheck` with zero errors
- [ ] **Build succeeds** — `pnpm run build` completes without errors

### Post-deployment

- [ ] **Login flow** — Visit `/login`, sign in with invited Google account, verify redirect to dashboard
- [ ] **Invite rejection** — Sign in with a non-invited Google account, verify error message
- [ ] **Area filter** — Click each area chip, verify URL updates and results filter
- [ ] **Infinite scroll** — Scroll to bottom, verify more businesses load
- [ ] **Business detail** — Click a business card, verify detail page loads with all fields
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
