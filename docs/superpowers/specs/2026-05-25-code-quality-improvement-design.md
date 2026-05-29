# Code Quality Improvement — Design Spec

**Date:** 2026-05-25
**Scope:** All ~45 issues from security, code quality, and performance reviews
**Approach:** 6 independent PRs, each deployable and verifiable

---

## PR1: Hoàn tất database refactor

**Problem:** `app/lib/server/db.server.ts` has been refactored into `app/lib/server/database/` (4 files: `db.server.ts`, `businesses.server.ts`, `business-notes.server.ts`, `invites.server.ts`), but 2 route files still import from the deleted path.

**Files affected:**

| File                           | Line | Change                                                                   |
| ------------------------------ | ---- | ------------------------------------------------------------------------ |
| `app/routes/dashboard.tsx`     | 4    | `"~/lib/server/db.server"` → `"~/lib/server/database/businesses.server"` |
| `app/routes/api.businesses.ts` | 2    | Same import path change                                                  |

**Verification:** `pnpm run typecheck && pnpm run build`

---

## PR2: Bảo mật

### 2.1 CSRF protection on invite endpoint

**File:** `app/routes/invite.tsx:28`

Add `verifySameOrigin(request)` at the top of the action, matching existing pattern in notes and status APIs.

### 2.2 Server-side status transition validation

**File:** `app/routes/api.businesses.$id.status.ts`

Current behavior: only validates against flat allowlist, allows any-to-any transition via direct API call.
Fix: query current status from DB, validate against `NEXT_STATUS` map before UPDATE.

### 2.3 Defense-in-depth auth check in status action

**File:** `app/routes/api.businesses.$id.status.ts:8`

Add `context` destructuring and session check inside the action, matching pattern in notes API.

### 2.4 Gate query logging behind dev mode

**File:** `app/lib/server/database/db.server.ts:19-22, 57-64, 94`

Wrap all `console.log` statements in `if (process.env.NODE_ENV === "development")`. Keep `console.error` for errors.

### 2.5 Explicit pool connection limits

**File:** `app/lib/server/database/db.server.ts:3-5`

Add `max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000` to Pool config.

### 2.6 Input length limits

**File:** `app/lib/utils.ts:11-13`

Add optional `maxLength` parameter to `getStringParam`. Apply max 200 chars for `search` and `region` params in `dashboard.tsx` and `api.businesses.ts`.

### 2.7 Rate limiting

Not implemented in code. Add note in AGENTS.md recommending Cloudflare/reverse-proxy-level rate limiting.

### Note: Rotate secrets

Manual task — rotate `BETTER_AUTH_SECRET`, Google OAuth Client Secret, Neon password. `.env` is already in `.gitignore`.

---

## PR3: Xử lý lỗi & resilience

### 3.1 try/catch in all loaders and actions

Wrap all DB queries in try/catch blocks, returning proper `{ message, error }` JSON responses with 500 status, or throwing Response objects for page loaders.

**Files:** `dashboard.tsx`, `api.businesses.ts`, `businesses.$id.tsx`, `api.businesses.$id.notes.ts`, `api.businesses.$id.status.ts`

### 3.2 Validate filter values in buildWhereClause

**File:** `app/lib/server/database/businesses.server.ts:12-37`

Check `region` against `REGIONS` constant and `status` against `STATUS_MAP` before appending to WHERE clause.

### 3.3 Validate ID in business-notes functions

**File:** `app/lib/server/database/business-notes.server.ts:5-15`

Parse string IDs to number before querying integer columns. Throw on NaN.

### 3.4 Unfiltered COUNT(\*) optimization

**File:** `app/lib/server/database/businesses.server.ts:61-73`

When no filters active, use `pg_class.reltuples` estimate instead of full `COUNT(*)` scan.

### 3.5 Error state for notes-section

**File:** `app/features/business-detail/components/notes-section.tsx`

Display error message from `noteFetcher.data.error` when present.

### 3.6 Notes API — return single note on mutation

**File:** `app/routes/api.businesses.$id.notes.ts:184`

After POST, return `{ note: { id, content, created_by, created_at } }` instead of calling `getBusinessNotes()` to re-fetch the entire list. Client prepends the new note.

---

## PR4: Conventions & cleanup

### 4.1 Remove useCallback / useMemo

Convert all `useCallback` and `useMemo` to plain functions per AGENTS.md convention.
Exception: keep `useCallback` on `handleSignOut` in `app-layout.tsx` as it's passed as a prop to `memo(AdminSidebar)`.

**Files:** `app-layout.tsx`, `app-layout-template.tsx`, `select.tsx`, `useTheme.ts`

### 4.2 Fix `any` types

- `notes-section.tsx:20,70`: `noteFetcher: any` → `ReturnType<typeof useFetcher>`
- `notes-section.tsx:233`: `useRouteLoaderData<any>()` → typed `AppLayoutData` interface
- `tooltip.tsx:23-24`: `NodeJS.Timeout` → `ReturnType<typeof setTimeout>`
- `tooltip.tsx:100,106`: `ReactElement<any>`, `ref as any` → typed

### 4.3 Create barrel exports

Create `index.ts` in:

- `app/features/dashboard/components/`
- `app/features/business-detail/components/`
- `app/features/business-detail/hooks/`
- `app/features/layout/components/`

### 4.4 Standardize imports to barrel pattern

Convert direct file imports to barrel imports (`~/shared/components`) in:

- `filter-bar.tsx`
- `business-table.tsx`
- `business-sidebar.tsx`
- `business-details.tsx`

### 4.5 Fix HTML lang

**File:** `app/root.tsx:29` — `lang="en"` → `lang="vi"`

### 4.6 Vietnamese aria-labels

**File:** `theme-toggle.tsx:12` — English aria-label → Vietnamese

### 4.7 Fix NEXT_STATUS["rejected"] contradiction

**File:** `app/lib/constants.ts:20` — Change `rejected: [...]` to `rejected: []` (terminal status). UI message already says "không thể thay đổi trạng thái".

### 4.8 Remove empty features/auth/ directory

### 4.9 Tooltip import cleanup

**File:** `tooltip.tsx:1` — Remove React namespace import, use named imports directly. Replace `React.memo` → `memo`, `React.Children.only` → `Children.only`, `React.cloneElement` → `cloneElement`.

---

## PR5: Database performance

### 5.1 Add database indexes

Extend `setupDatabase()` with `CREATE INDEX IF NOT EXISTS` for:

- `businesses(status)`
- `businesses(region)`
- `businesses(status, id DESC)`
- `business_notes(business_id, deleted_at, created_at DESC)`
- `user_invites(email)`

### 5.2 SELECT \* → column list in dashboard query

**File:** `app/lib/server/database/businesses.server.ts:54`

Select only `id, business_name, phone, address, status, region, rating` instead of `*` to avoid fetching heavy `review_image_urls` text array. Keep `SELECT *` in `getBusinessById` (detail page needs all fields).

### 5.3 Parallel queries in business detail loader

**File:** `app/routes/businesses.$id.tsx:16-21`

Use `Promise.all([getBusinessById(id), getBusinessNotes(id)])` instead of sequential await.

### 5.4 Notes pagination

**File:** `app/lib/server/database/business-notes.server.ts:5-13`

Add `limit` and `offset` params to `getBusinessNotes`. Default limit 50.

### 5.5 Reduce notes mutation payload

Covered in PR3.6 — return only the changed note.

### 5.6 Cache-Control headers

Add `Cache-Control: private, max-age=10` to GET responses, `no-store` to mutation responses.

**Files:** `api.businesses.ts`, `dashboard.tsx`, `businesses.$id.tsx`, `api.businesses.$id.notes.ts`

---

## PR6: Client performance & UX

### 6.1 Remove redundant useSession() call

**File:** `app/routes/app-layout.tsx:27`

Remove `authClient.useSession()`. Use only `useLoaderData<typeof loader>()` for user data. Remove `authClient` import.

### 6.2 Memoize NoteItem

**File:** `app/features/business-detail/components/notes-section.tsx`

Wrap `NoteItem` in `React.memo` to prevent all items re-rendering when a new note is added.

### 6.3 Optimize review images

**File:** `app/features/business-detail/components/review-images.tsx:22-28`

Add `width`, `height`, `sizes`, and `loading="lazy"` attributes to `<img>` tags.

### 6.4 Non-blocking font loading

**File:** `app/root.tsx:23-27`

Use `media="print" onload="this.media='all'"` pattern for Google Fonts stylesheet link.

### 6.5 Fix filter-bar useEffect sync loop

**File:** `app/features/dashboard/components/filter-bar.tsx:36-39`

Remove `useEffect` that syncs `searchParams` to state. Add `key` prop to `FilterBar` in `dashboard-template.tsx` that changes when search params change from external sources.

### 6.6 Fix AdminSidebar memo effectiveness

After removing `useCallback` in PR4 for most cases, keep `useCallback` on `handleSignOut` specifically because it's passed to `memo(AdminSidebar)`. After PR6.1, `currentUser` object identity comes from stable loader data.

### 6.7 Notes character count

**File:** `app/features/business-detail/components/notes-section.tsx`

Add `maxLength={5000}` to textarea and show remaining character count when below 500 chars.

---

## Dependencies

```
PR1 ──► PR2 ──► PR3 ──► PR4 ──► PR5 ──► PR6
```

PR1 must go first (fixes broken imports). PR2-PR6 can technically be parallelized but are ordered for logical progression and to avoid merge conflicts on shared files.

---

## Files touched (summary)

| PR  | Files modified                                                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR1 | `dashboard.tsx`, `api.businesses.ts`                                                                                                                                                                                                                                          |
| PR2 | `invite.tsx`, `api.businesses.$id.status.ts`, `db.server.ts`, `utils.ts`, `constants.ts`, `dashboard.tsx`, `api.businesses.ts`, `AGENTS.md`                                                                                                                                   |
| PR3 | `dashboard.tsx`, `api.businesses.ts`, `businesses.$id.tsx`, `api.businesses.$id.notes.ts`, `api.businesses.$id.status.ts`, `businesses.server.ts`, `business-notes.server.ts`, `notes-section.tsx`                                                                            |
| PR4 | `app-layout.tsx`, `app-layout-template.tsx`, `select.tsx`, `useTheme.ts`, `notes-section.tsx`, `tooltip.tsx`, `root.tsx`, `theme-toggle.tsx`, `constants.ts`, `filter-bar.tsx`, `business-table.tsx`, `business-sidebar.tsx`, `business-details.tsx`, +4 new `index.ts` files |
| PR5 | `db.server.ts`, `businesses.server.ts`, `businesses.$id.tsx`, `business-notes.server.ts`, `api.businesses.ts`, `dashboard.tsx`, `api.businesses.$id.notes.ts`                                                                                                                 |
| PR6 | `app-layout.tsx`, `notes-section.tsx`, `review-images.tsx`, `root.tsx`, `filter-bar.tsx`, `dashboard-template.tsx`                                                                                                                                                            |
