# Code Quality Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix ~45 issues from security, code quality, and performance audits across 6 sequential PRs.

**Architecture:** Each PR addresses a logical group of issues. PR1 must go first (fixes broken imports). PR2-PR6 are ordered for logical progression and to avoid merge conflicts on shared files.

**Tech Stack:** React Router 7, Neon Postgres, Better Auth, TailwindCSS v4, TypeScript

---

## PR1: Hoàn tất database refactor

### Task 1.1: Fix import in dashboard.tsx

**Files:**
- Modify: `app/routes/dashboard.tsx:4`

- [ ] **Step 1: Fix import path**

```tsx
// Change line 4 from:
import { getBusinesses, getBusinessesCount } from "~/lib/server/db.server";
// To:
import { getBusinesses, getBusinessesCount } from "~/lib/server/database/businesses.server";
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/dashboard.tsx
git commit -m "fix: update dashboard import to use database/businesses.server"
```

### Task 1.2: Fix import in api.businesses.ts

**Files:**
- Modify: `app/routes/api.businesses.ts:2`

- [ ] **Step 1: Fix import path**

```tsx
// Change line 2 from:
import { getBusinesses } from "~/lib/server/db.server";
// To:
import { getBusinesses } from "~/lib/server/database/businesses.server";
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/api.businesses.ts
git commit -m "fix: update api.businesses import to use database/businesses.server"
```

### Task 1.3: Verify PR1

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit if needed**

```bash
git status
```

---

## PR2: Bảo mật

### Task 2.1: Add CSRF protection to invite endpoint

**Files:**
- Modify: `app/routes/invite.tsx:1,28`

- [ ] **Step 1: Add verifySameOrigin import and call**

Add import after line 2 (`import { Form, useActionData, useNavigation } from "react-router";`):
```tsx
import { verifySameOrigin } from "~/lib/server/csrf.server";
```

Add `verifySameOrigin(request);` at the start of the action function body (line 29, after the opening brace):
```tsx
export async function action({ request }: ActionFunctionArgs) {
  verifySameOrigin(request);

  const formData = await request.formData();
  // ... rest unchanged
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/invite.tsx
git commit -m "fix: add CSRF protection to invite endpoint"
```

### Task 2.2: Server-side status transition validation + defense-in-depth auth

**Files:**
- Modify: `app/routes/api.businesses.$id.status.ts:1-8,13-23`

- [ ] **Step 1: Add imports**

Change line 1 from:
```ts
import type { ActionFunctionArgs } from "react-router";
```
To:
```ts
import type { ActionFunctionArgs } from "react-router";
import { sessionContext } from "~/lib/server/require-auth.server";
import { NEXT_STATUS } from "~/lib/constants";
```

- [ ] **Step 2: Add auth check and transition validation**

Replace the action function body (starting from `export async function action`) with:

```ts
export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  if (!session) {
    return Response.json(
      { message: "Unauthorized", error: "unauthorized" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const status = formData.get("status")?.toString();

  if (!status || !ALLOWED.includes(status)) {
    return Response.json(
      { message: "Invalid status", error: "invalid_status" },
      { status: 400 },
    );
  }

  const currentResult = await sql.query(
    `SELECT status FROM businesses WHERE id = $1`,
    [params.id],
  );

  if (currentResult.length === 0) {
    return Response.json(
      { message: "Business not found", error: "business_not_found" },
      { status: 404 },
    );
  }

  const currentStatus = currentResult[0].status;
  const allowedTransitions = NEXT_STATUS[currentStatus] ?? [];

  if (currentStatus !== status && !allowedTransitions.includes(status)) {
    return Response.json(
      {
        message: `Không thể chuyển từ ${currentStatus} sang ${status}`,
        error: "invalid_transition",
      },
      { status: 400 },
    );
  }

  const result = await sql.query(
    `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
    [status, params.id],
  );

  return Response.json(
    {
      message: "Status updated successfully",
      data: result[0],
    },
    { status: 200 },
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/routes/api.businesses.$id.status.ts
git commit -m "fix: add server-side status transition validation and defense-in-depth auth"
```

### Task 2.3: Gate query logging behind dev mode

**Files:**
- Modify: `app/lib/server/database/db.server.ts:19-22, 57-64, 70-72, 94`

- [ ] **Step 1: Gate logQuery console.log**

Replace line 19-21 in `logQuery`:
```ts
// Before (line 19-21):
    console.log(
      `[${label}] Query: ${queryText.trim()} | Params: ${JSON.stringify(params)} | Time: ${duration}ms`,
    );
// After:
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${label}] Query: ${queryText.trim()} | Params: ${JSON.stringify(params)} | Time: ${duration}ms`,
      );
    }
```

- [ ] **Step 2: Gate pool callback logs**

Replace lines 57-64 (success branch):
```ts
// Before (lines 62-64):
        console.log(
          `[Pool] Query: ${logText.trim()} | Params: ${JSON.stringify(logParams)} | Time: ${duration}ms`,
        );
// After:
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Pool] Query: ${logText.trim()} | Params: ${JSON.stringify(logParams)} | Time: ${duration}ms`,
          );
        }
```

- [ ] **Step 3: Gate pool.query return logs**

In the `pool.query` override, the `return` calls `logQuery` which is already gated from Step 1. No change needed — the gating at `logQuery` covers these.

- [ ] **Step 4: Commit**

```bash
git add app/lib/server/database/db.server.ts
git commit -m "fix: gate SQL query logging behind NODE_ENV=development"
```

### Task 2.4: Explicit pool connection limits

**Files:**
- Modify: `app/lib/server/database/db.server.ts:3-5`

- [ ] **Step 1: Add pool config**

Replace lines 3-5:
```ts
// Before:
export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});
// After:
export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/db.server.ts
git commit -m "fix: add explicit pool connection limits"
```

### Task 2.5: Input length limits

**Files:**
- Modify: `app/lib/utils.ts:11-13`
- Modify: `app/routes/dashboard.tsx:11-13`
- Modify: `app/routes/api.businesses.ts:9-10`

- [ ] **Step 1: Add maxLength to getStringParam**

Replace `getStringParam` function (lines 10-13):
```ts
// Before:
export function getStringParam(url: URL | string, key: string, defaultValue = ""): string {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  return searchParams.get(key) || defaultValue;
}
// After:
export function getStringParam(url: URL | string, key: string, defaultValue = "", maxLength?: number): string {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const value = searchParams.get(key) || defaultValue;
  return maxLength && value.length > maxLength ? value.slice(0, maxLength) : value;
}
```

- [ ] **Step 2: Apply maxLength in dashboard.tsx**

Change lines 11-13:
```tsx
// Before:
  const region = getStringParam(url, "region");
  const search = getStringParam(url, "search");
  const status = getStringParam(url, "status");
// After:
  const region = getStringParam(url, "region", "", 200);
  const search = getStringParam(url, "search", "", 200);
  const status = getStringParam(url, "status", "", 50);
```

- [ ] **Step 3: Apply maxLength in api.businesses.ts**

Change lines 9-10:
```tsx
// Before:
  const region = getStringParam(url, "region");
  const search = getStringParam(url, "search");
// After:
  const region = getStringParam(url, "region", "", 200);
  const search = getStringParam(url, "search", "", 200);
```

- [ ] **Step 4: Commit**

```bash
git add app/lib/utils.ts app/routes/dashboard.tsx app/routes/api.businesses.ts
git commit -m "fix: add input length limits to getStringParam, apply to search/region/status"
```

### Task 2.6: AGENTS.md rate limiting note

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add rate limiting section**

Add after the "Gotchas" section:
```md
## Rate limiting

Rate limiting is not implemented in application code. Recommended approaches:
- **Cloudflare**: Use WAF rate limiting rules (preferred for production)
- **Nginx**: `limit_req_zone` + `limit_req` directives (if self-hosted)
- Apply to mutation endpoints: `/api/businesses/:id/notes`, `/api/businesses/:id/status`, `/invite`
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add rate limiting recommendation to AGENTS.md"
```

### Task 2.7: Verify PR2

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

---

## PR3: Xử lý lỗi & resilience

### Task 3.1: try/catch in dashboard.tsx loader

**Files:**
- Modify: `app/routes/dashboard.tsx:9-31`

- [ ] **Step 1: Wrap loader body in try/catch**

Wrap lines 10-30 (the content of the loader function) in try/catch:

```tsx
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const region = getStringParam(url, "region", "", 200);
    const search = getStringParam(url, "search", "", 200);
    const status = getStringParam(url, "status", "", 50);
    const page = getIntParam(url, "page", 1, { min: 1 });
    const limit = getIntParam(url, "limit", 20, { min: 1 });

    const [businesses, totalCount] = await Promise.all([
      getBusinesses({ limit, offset: (page - 1) * limit, region, search, status }),
      getBusinessesCount({ region, search, status }),
    ]);

    return { businesses, totalCount, page, limit };
  } catch (err) {
    console.error("Dashboard loader error:", err);
    throw new Response("Lỗi máy chủ. Vui lòng thử lại sau.", { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/dashboard.tsx
git commit -m "fix: add try/catch to dashboard loader"
```

### Task 3.2: try/catch in api.businesses.ts loader

**Files:**
- Modify: `app/routes/api.businesses.ts:5-19`

- [ ] **Step 1: Wrap loader body in try/catch**

```tsx
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const offset = getIntParam(url, "offset", 0, { min: 0 });
    const limit = getIntParam(url, "limit", 20, { min: 1, max: 50 });
    const region = getStringParam(url, "region", "", 200);
    const search = getStringParam(url, "search", "", 200);
    const status = getStringParam(url, "status");

    const businesses = await getBusinesses({
      limit,
      offset,
      region,
      search,
      status,
    });

    return Response.json({ businesses });
  } catch (err) {
    console.error("api.businesses loader error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error", businesses: [] },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/api.businesses.ts
git commit -m "fix: add try/catch to api.businesses loader"
```

### Task 3.3: try/catch + parallel queries in businesses.$id.tsx loader

**Files:**
- Modify: `app/routes/businesses.$id.tsx:11-26`

- [ ] **Step 1: Wrap in try/catch and use Promise.all**

```tsx
export async function loader({ params }: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      throw new Response("Mã doanh nghiệp không hợp lệ", { status: 400 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      throw new Response("Mã doanh nghiệp không hợp lệ", { status: 400 });
    }

    const [business, notes] = await Promise.all([
      getBusinessById(id),
      getBusinessNotes(id),
    ]);

    if (!business) {
      throw new Response("Không tìm thấy doanh nghiệp", { status: 404 });
    }

    return { business, notes };
  } catch (err) {
    if (err instanceof Response) throw err;
    console.error("Business detail loader error:", err);
    throw new Response("Lỗi máy chủ. Vui lòng thử lại sau.", { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/businesses.$id.tsx
git commit -m "fix: add try/catch and parallel queries to business detail loader"
```

### Task 3.4: try/catch in api.businesses.$id.notes.ts action

**Files:**
- Modify: `app/routes/api.businesses.$id.notes.ts:25-186`

- [ ] **Step 1: Wrap mutation block in try/catch**

Wrap the entire action body after `verifySameOrigin(request)` (from line 28 to the `return Response.json({ notes })`) in a try/catch:

```ts
export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  const userEmail = session.user.email;

  if (!params.id) {
    return Response.json(
      { message: "Business ID is required", code: "business_id_required", error: "Business ID is required" },
      { status: 400 },
    );
  }

  try {
    const businessExists = await checkBusinessExists(params.id);
    if (!businessExists) {
      return Response.json(
        { message: "Business not found", code: "business_not_found", error: "business not found" },
        { status: 404 },
      );
    }

    // ... rest of method handling (POST, PATCH, DELETE) unchanged ...

    return Response.json({ notes });
  } catch (err) {
    console.error("Notes action error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error" },
      { status: 500 },
    );
  }
}
```

The existing method handling (POST/PATCH/DELETE blocks) and the final `const notes = await getBusinessNotes(params.id); return Response.json({ notes });` remain unchanged inside the try block.

- [ ] **Step 2: Commit**

```bash
git add app/routes/api.businesses.$id.notes.ts
git commit -m "fix: add try/catch to notes action"
```

### Task 3.5: try/catch in api.businesses.$id.status.ts action

**Files:**
- Modify: `app/routes/api.businesses.$id.status.ts`

- [ ] **Step 1: Wrap DB operations in try/catch**

After `verifySameOrigin(request)` and session check (from Task 2.2), wrap the remaining body:

```ts
// ... existing auth + validation ...

  try {
    const currentResult = await sql.query(
      `SELECT status FROM businesses WHERE id = $1`,
      [params.id],
    );

    if (currentResult.length === 0) {
      return Response.json(
        { message: "Business not found", error: "business_not_found" },
        { status: 404 },
      );
    }

    const currentStatus = currentResult[0].status;
    const allowedTransitions = NEXT_STATUS[currentStatus] ?? [];

    if (currentStatus !== status && !allowedTransitions.includes(status)) {
      return Response.json(
        { message: `Không thể chuyển từ ${currentStatus} sang ${status}`, error: "invalid_transition" },
        { status: 400 },
      );
    }

    const result = await sql.query(
      `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
      [status, params.id],
    );

    return Response.json(
      { message: "Status updated successfully", data: result[0] },
      { status: 200 },
    );
  } catch (err) {
    console.error("Status action error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/api.businesses.$id.status.ts
git commit -m "fix: add try/catch to status action"
```

### Task 3.6: Validate filter values in buildWhereClause

**Files:**
- Modify: `app/lib/server/database/businesses.server.ts:12-37`

- [ ] **Step 1: Add constant imports and validate filters**

Add after line 1 (`import { sql } from "./db.server";`):
```ts
import { STATUS_MAP, REGIONS } from "../../constants";
```

Replace the filter conditions block (lines 21-32):
```ts
  if (filter.region && REGIONS[filter.region as keyof typeof REGIONS]) {
    conditions.push(`region = $${idx++}`);
    params.push(filter.region);
  }
  if (filter.search) {
    conditions.push(`business_name ILIKE $${idx++}`);
    params.push(`%${filter.search}%`);
  }
  if (filter.status && STATUS_MAP[filter.status]) {
    conditions.push(`status = $${idx++}`);
    params.push(filter.status);
  }
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/businesses.server.ts
git commit -m "fix: validate filter values against known constants in buildWhereClause"
```

### Task 3.7: Validate ID in business-notes functions

**Files:**
- Modify: `app/lib/server/database/business-notes.server.ts:5-15`

- [ ] **Step 1: Add ID validation helpers and apply**

Add after imports, before `getBusinessNotes`:
```ts
function parseId(id: string | number): number {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(num)) throw new Error("Invalid ID");
  return num;
}
```

Update `getBusinessNotes` to use it:
```ts
export async function getBusinessNotes(
  businessId: string | number,
): Promise<NoteRow[]> {
  const id = parseId(businessId);
  const result = await sql.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [id],
  );
  return result as NoteRow[];
}
```

Update `getBusinessNote` similarly:
```ts
export async function getBusinessNote(
  noteId: string | number,
): Promise<NoteRow | null> {
  const id = parseId(noteId);
  const result = await sql.query(
    `SELECT * FROM business_notes WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return result.length > 0 ? (result[0] as NoteRow) : null;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/business-notes.server.ts
git commit -m "fix: validate and parse IDs in business-notes functions"
```

### Task 3.8: Error state for notes-section + return single note on mutation

**Files:**
- Modify: `app/features/business-detail/components/notes-section.tsx`
- Modify: `app/routes/api.businesses.$id.notes.ts`

- [ ] **Step 1: Fix notes API POST to return single note**

In `app/routes/api.businesses.$id.notes.ts`, change the POST block ending (replace the final `return` after all mutations):

Replace the end of the action (the final two lines that fetch all notes and return):
```ts
// Remove:
  const notes = await getBusinessNotes(params.id);
  return Response.json({ notes });
```

And add specific returns for each method:

After the POST block's `createBusinessNote(...)` call:
```ts
    await createBusinessNote(params.id, content, userEmail);

    const notes = await getBusinessNotes(params.id);
    return Response.json({ notes, note: notes[0] });
```

After the PATCH block's `updateBusinessNote(...)` call:
```ts
    await updateBusinessNote(noteId, content);
```

After the DELETE block's `deleteBusinessNote(...)` call:
```ts
    await deleteBusinessNote(noteId);
```

And add after the PATCH block ends and before the DELETE block ends, a new `return` at the end of try:
```ts
    return Response.json({ notes: [] });
```

Wait — this is complex because the action handles 3 methods and currently returns all notes for all of them. For now, keep POST returning all notes but also include the new `note` field. PATCH/DELETE can continue returning empty or success. The client will use the `note` field from POST.

Actually the simplest approach: after POST, return `{ notes, note: newNote }`. After PATCH/DELETE, return `{ success: true }`. Keep `getBusinessNotes` only for the `loader`.

Here's the clean solution:

Replace the final block (the last 3 lines of the action, outside method blocks):
```ts
// Remove:
  const notes = await getBusinessNotes(params.id);
  return Response.json({ notes });
```

Add after POST block's `createBusinessNote`:
```ts
    await createBusinessNote(params.id, content, userEmail);
    const notes = await getBusinessNotes(params.id);
    return Response.json({ notes, note: notes[0] });
```

Add after PATCH block's `updateBusinessNote`:
```ts
    await updateBusinessNote(noteId, content);
    return Response.json({ success: true });
```

Add after DELETE block's `deleteBusinessNote`:
```ts
    await deleteBusinessNote(noteId);
    return Response.json({ success: true });
```

Make sure each method block now has its own `return` and remove the old shared return at the end.

- [ ] **Step 2: Add error display in notes-section.tsx**

Find the place where `noteFetcher.data` is used to render notes. Add an error check before the notes list:

```tsx
// After the useNotesManager hook call, add:
if (noteFetcher.data?.error) {
  return (
    <p className="text-sm text-destructive">
      Lỗi: {noteFetcher.data.message || "Đã xảy ra lỗi"}
    </p>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/routes/api.businesses.$id.notes.ts app/features/business-detail/components/notes-section.tsx
git commit -m "fix: return single note on POST, add error state to notes-section"
```

### Task 3.9: Verify PR3

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

---

## PR4: Conventions & cleanup

### Task 4.1: Remove useCallback/useMemo — 5 files

**Files:**
- Modify: `app/routes/app-layout.tsx`
- Modify: `app/features/layout/components/app-layout-template.tsx`
- Modify: `app/shared/components/select.tsx`
- Modify: `app/shared/hooks/useTheme.ts`

- [ ] **Step 1: Fix app-layout.tsx**

Remove `useCallback` and `useMemo` from imports (line 3):
```tsx
// Before:
import { useCallback, useMemo } from "react";
// After:
import { useCallback } from "react"; // keep only for handleSignOut (passed to memo)
```

Remove `useMemo` wrapping `currentUser` (lines 43-47):
```tsx
// Before:
  const currentUser = useMemo(() => ({
    name: sessionUser?.name ?? loaderUser.name,
    email: sessionUser?.email ?? loaderUser.email,
    image: sessionUser?.image ?? null,
  }), [sessionUser?.name, sessionUser?.email, sessionUser?.image, loaderUser.name, loaderUser.email]);
// After:
  const currentUser = {
    name: loaderUser.name,
    email: loaderUser.email,
    image: loaderUser.image ?? null,
  };
```

Remove `useMemo` wrapping `breadcrumbs` (lines 51-53):
```tsx
// Before:
  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(location.pathname, matches as unknown as RouteMatch[]);
  }, [location.pathname, matches]);
// After:
  const breadcrumbs = getBreadcrumbs(location.pathname, matches as unknown as RouteMatch[]);
```

Remove `sessionUser` and `loaderUser` destructuring — unused after above changes.

- [ ] **Step 2: Fix app-layout-template.tsx**

Remove `useCallback` from import (line 1):
```tsx
// Before:
import { useState, useCallback } from "react";
// After:
import { useState } from "react";
```

Convert callbacks (lines 35-43):
```tsx
// Before:
  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);
// After:
  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const handleOpenMobile = () => {
    setIsMobileOpen(true);
  };
```

- [ ] **Step 3: Fix select.tsx**

Remove `useCallback` from import (line 1):
```tsx
// Before:
import { useState, useRef, useEffect, useCallback, useId } from "react";
// After:
import { useState, useRef, useEffect, useId } from "react";
```

Convert `close` and `select` callbacks (lines 49-58):
```tsx
// Before:
  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const select = useCallback(
    (key: string) => {
      onChange(key);
      close();
    },
    [onChange, close],
  );
// After:
  const close = () => {
    setOpen(false);
    setFocusIndex(-1);
  };

  const select = (key: string) => {
    onChange(key);
    close();
  };
```

**IMPORTANT:** Since `close` and `select` are used in `useEffect` dependencies (lines 72, 104), they need to either stay as `useCallback` or the effects need updating. Since `close` no longer has stable identity, the effects that depend on it will re-run more often. This is acceptable — the cost is negligible. The `select` prop `onChange` varies per render anyway.

- [ ] **Step 4: Fix useTheme.ts**

Remove `useCallback` from import:
```tsx
// Before:
import { useCallback, useEffect, useState } from "react";
// After:
import { useEffect, useState } from "react";
```

Convert `toggleTheme` and `setThemeExplicit`:
```tsx
// Before (line ~58):
  const toggleTheme = useCallback(() => { ... }, [theme]);
// After:
  const toggleTheme = () => { ... };

// Before (line ~66):
  const setThemeExplicit = useCallback((newTheme: Theme) => { ... }, []);
// After:
  const setThemeExplicit = (newTheme: Theme) => { ... };
```

- [ ] **Step 5: Commit**

```bash
git add app/routes/app-layout.tsx app/features/layout/components/app-layout-template.tsx app/shared/components/select.tsx app/shared/hooks/useTheme.ts
git commit -m "refactor: remove useCallback/useMemo per convention, keep only handleSignOut"
```

### Task 4.2: Fix `any` types — notes-section.tsx

**Files:**
- Modify: `app/features/business-detail/components/notes-section.tsx`

- [ ] **Step 1: Fix noteFetcher type + route loader data type**

Remove any `import type { useFetcher }` and use inline type:

In `NoteInputProps` interface (line ~20):
```tsx
// Before:
  noteFetcher: any;
// After:
  noteFetcher: ReturnType<typeof useFetcher>;
```

In `NoteItemProps` interface (line ~70):
```tsx
// Before:
  noteFetcher: any;
// After:
  noteFetcher: ReturnType<typeof useFetcher>;
```

In the component body (line ~233):
```tsx
// Before:
  const user = useRouteLoaderData<any>("routes/app-layout");
// After:
  type AppLayoutData = { user: { name: string; email: string; image?: string | null } };
  const user = useRouteLoaderData<AppLayoutData>("routes/app-layout");
```

- [ ] **Step 2: Commit**

```bash
git add app/features/business-detail/components/notes-section.tsx
git commit -m "fix: replace any types in notes-section with proper types"
```

### Task 4.3: Fix `any` types — tooltip.tsx

**Files:**
- Modify: `app/shared/components/tooltip.tsx`

- [ ] **Step 1: Fix imports and types**

Change line 1:
```tsx
// Before:
import React, { useState, useEffect, useRef, useId, memo, Children, cloneElement } from "react";
// After:
import { useState, useEffect, useRef, useId, memo, Children, cloneElement } from "react";
import type { ReactElement, Ref } from "react";
```

Change `NodeJS.Timeout` (lines 23-24):
```tsx
// Before:
  const showTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
// After:
  const showTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Fix `React.memo` → `memo` (find all occurrences and replace).

Fix the component function signature type (line ~100):
```tsx
// Before:
function Tooltip({ children, content, delay = 300 }: { children: ReactElement<any>; content: string; delay?: number }) {
// After:
function TooltipComponent({ children, content, delay = 300 }: { children: ReactElement<{ ref?: Ref<HTMLElement> }>; content: string; delay?: number }) {
```

Fix `ref as any` (line ~106):
```tsx
// Before:
  ref as any,
// After:
  ref as Ref<HTMLElement>,
```

Replace `React.cloneElement` → `cloneElement`, `React.Children.only` → `Children.only`.

Update the export at the bottom:
```tsx
// Before:
export default React.memo(Tooltip);
// After:
export default memo(TooltipComponent);
```

Rename the inner function from `Tooltip` to `TooltipComponent` to avoid collision with the export name.

- [ ] **Step 2: Commit**

```bash
git add app/shared/components/tooltip.tsx
git commit -m "fix: remove React namespace import, fix NodeJS.Timeout and any types in tooltip"
```

### Task 4.4: Create barrel exports

**Files:**
- Create: `app/features/dashboard/components/index.ts`
- Create: `app/features/business-detail/components/index.ts`
- Create: `app/features/business-detail/hooks/index.ts`
- Create: `app/features/layout/components/index.ts`

- [ ] **Step 1: Create dashboard components barrel**

```ts
// app/features/dashboard/components/index.ts
export { DashboardTemplate } from "./dashboard-template";
export type { DashboardTemplateProps } from "./dashboard-template";
export { FilterBar } from "./filter-bar";
export { BusinessTable } from "./business-table";
export type { BusinessTableProps } from "./business-table";
```

- [ ] **Step 2: Create business-detail components barrel**

```ts
// app/features/business-detail/components/index.ts
export { BusinessDetails } from "./business-details";
export { BusinessSidebar } from "./business-sidebar";
export { StatusCard } from "./status-card";
export { NotesSection } from "./notes-section";
export { ReviewImages } from "./review-images";
```

- [ ] **Step 3: Create business-detail hooks barrel**

```ts
// app/features/business-detail/hooks/index.ts
export { useNotesManager } from "./useNotesManager";
```

- [ ] **Step 4: Create layout components barrel**

```ts
// app/features/layout/components/index.ts
export { AppLayoutTemplate } from "./app-layout-template";
export type { AppLayoutTemplateProps } from "./app-layout-template";
export { AdminSidebar } from "./admin-sidebar";
export type { AdminSidebarProps } from "./admin-sidebar";
```

- [ ] **Step 5: Commit**

```bash
git add app/features/dashboard/components/index.ts app/features/business-detail/components/index.ts app/features/business-detail/hooks/index.ts app/features/layout/components/index.ts
git commit -m "feat: add barrel exports for feature components and hooks"
```

### Task 4.5: Standardize imports to barrel pattern

**Files:**
- Modify: `app/features/dashboard/components/filter-bar.tsx`
- Modify: `app/features/dashboard/components/business-table.tsx`
- Modify: `app/features/business-detail/components/business-sidebar.tsx`
- Modify: `app/features/business-detail/components/business-details.tsx`

- [ ] **Step 1: Fix filter-bar.tsx imports**

Change lines 3-6:
```tsx
// Before:
import { Input } from "~/shared/components/input";
import { Select } from "~/shared/components/select";
import { Button } from "~/shared/components/button";
// After:
import { Input, Select, Button } from "~/shared/components";
```

- [ ] **Step 2: Fix business-table.tsx imports**

Change lines 8-11:
```tsx
// Before:
import { Badge } from "~/shared/components/badge";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { Button } from "~/shared/components/button";
import { DataTable } from "~/shared/components/table";
import type { DataTableColumn } from "~/shared/components/table";
import { Tooltip } from "~/shared/components/tooltip";
// After:
import { Badge, Button, DataTable, Tooltip } from "~/shared/components";
import type { DataTableColumn } from "~/shared/components/table";
import { ExternalLinkIcon } from "~/shared/icons";
```

- [ ] **Step 3: Fix business-sidebar.tsx imports**

Change lines 2-7:
```tsx
// Before:
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/card";
// After:
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
```

- [ ] **Step 4: Fix business-details.tsx imports**

Change lines 2-7:
```tsx
// Before:
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/card";
import { Field } from "~/shared/components/field";
// After:
import { Card, CardContent, CardHeader, CardTitle, Field } from "~/shared/components";
```

- [ ] **Step 5: Commit**

```bash
git add app/features/dashboard/components/filter-bar.tsx app/features/dashboard/components/business-table.tsx app/features/business-detail/components/business-sidebar.tsx app/features/business-detail/components/business-details.tsx
git commit -m "refactor: standardize imports to barrel pattern"
```

### Task 4.6: Fix HTML lang and Vietnamese aria-labels

**Files:**
- Modify: `app/root.tsx:29`
- Modify: `app/shared/components/theme-toggle.tsx:12`

- [ ] **Step 1: Fix HTML lang**

Change line 29:
```tsx
// Before:
    <html lang="en">
// After:
    <html lang="vi">
```

- [ ] **Step 2: Fix theme-toggle aria-label**

Change line 12:
```tsx
// Before:
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
// After:
      aria-label={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
```

- [ ] **Step 3: Commit**

```bash
git add app/root.tsx app/shared/components/theme-toggle.tsx
git commit -m "fix: set html lang=vi and use Vietnamese aria-labels"
```

### Task 4.7: Fix NEXT_STATUS rejected + remove empty auth directory

**Files:**
- Modify: `app/lib/constants.ts:20`

- [ ] **Step 1: Make rejected truly terminal**

Change line 20:
```ts
// Before:
  rejected: ["new", "approached", "contacted", "qualified"],
// After:
  rejected: [],
```

- [ ] **Step 2: Remove empty features/auth directory**

```bash
rm -rf app/features/auth
```

- [ ] **Step 3: Commit**

```bash
git add app/lib/constants.ts
git rm -r app/features/auth 2>/dev/null || true
git add app/features/auth 2>/dev/null || true
git commit -m "fix: make rejected status terminal, remove empty features/auth"
```

### Task 4.8: Verify PR4

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors. If import errors occur from barrel changes, fix any missing re-exports in `shared/components/index.ts`.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

---

## PR5: Database performance

### Task 5.1: Add setupDatabase with indexes + wire into auth.server.ts

**Files:**
- Modify: `app/lib/server/database/db.server.ts` (add function)
- Modify: `app/lib/server/auth.server.ts` (import and call)

- [ ] **Step 1: Add setupDatabase function at end of db.server.ts**

```ts
export async function setupDatabase(): Promise<void> {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS user_invites (
      email TEXT PRIMARY KEY,
      invited_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS business_notes (
      id SERIAL PRIMARY KEY,
      business_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `);

  await sql.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'businesses' AND column_name = 'status'
      ) THEN
        ALTER TABLE businesses ADD COLUMN status TEXT DEFAULT 'new';
      END IF;
    END $$;
  `);

  // Performance indexes
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_businesses_status_id ON businesses(status, id DESC)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_business_notes_bid ON business_notes(business_id, deleted_at, created_at DESC)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_user_invites_email ON user_invites(email)`);
}
```

- [ ] **Step 2: Add setupDatabase call in auth.server.ts**

Change the import line 2 to include `setupDatabase`:
```ts
// Before:
import { pool, sql } from "~/lib/server/database/db.server";
// After:
import { pool, sql, setupDatabase } from "~/lib/server/database/db.server";
```

Add `setupDatabase` call inside the session hook (runs on first session creation per AGENTS.md spec):
```ts
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          await setupDatabase();  // <-- add this line
          const result = await sql.query(
            // ... rest unchanged
```

- [ ] **Step 3: Commit**

```bash
git add app/lib/server/database/db.server.ts app/lib/server/auth.server.ts
git commit -m "feat: add setupDatabase with auto-migration, indexes, and wire into auth hook"
```

### Task 5.2: SELECT * → column list in dashboard query

**Files:**
- Modify: `app/lib/server/database/businesses.server.ts:54`

- [ ] **Step 1: Change query to specific columns**

Change line 53-55:
```ts
// Before:
  const result = await sql.query(
    `SELECT * FROM businesses ${where} ORDER BY id DESC LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
    params,
  );
// After:
  const result = await sql.query(
    `SELECT id, business_name, phone, address, status, region, rating
     FROM businesses ${where} ORDER BY id DESC LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
    params,
  );
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/businesses.server.ts
git commit -m "perf: select only needed columns in dashboard query instead of SELECT *"
```

### Task 5.3: Unfiltered COUNT(*) optimization

**Files:**
- Modify: `app/lib/server/database/businesses.server.ts:61-73`

- [ ] **Step 1: Add pg_class estimate for unfiltered counts**

Replace the `getBusinessesCount` function:
```ts
export async function getBusinessesCount({
  region = "",
  search = "",
  status = "",
}: Pick<BusinessFilter, "region" | "search" | "status"> = {}): Promise<number> {
  const hasFilters = !!(region || search || status);

  if (!hasFilters) {
    const result = await sql.query(
      `SELECT reltuples::bigint AS count FROM pg_class WHERE relname = 'businesses'`,
    );
    return Number(result[0].count);
  }

  const { where, params } = buildWhereClause({ region, search, status });
  const result = await sql.query(
    `SELECT COUNT(*) AS count FROM businesses ${where}`,
    params,
  );
  return Number((result[0] as { count: string | number }).count);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/businesses.server.ts
git commit -m "perf: use pg_class reltuples estimate for unfiltered COUNT(*)"
```

### Task 5.4: Notes pagination

**Files:**
- Modify: `app/lib/server/database/business-notes.server.ts:5-13`

- [ ] **Step 1: Add limit/offset params (reuses parseId from Task 3.7)**

Replace `getBusinessNotes`:
```ts
export async function getBusinessNotes(
  businessId: string | number,
  limit = 50,
  offset = 0,
): Promise<NoteRow[]> {
  const id = parseId(businessId);

  const result = await sql.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [id, limit, offset],
  );
  return result as NoteRow[];
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/server/database/business-notes.server.ts
git commit -m "perf: add limit/offset params to getBusinessNotes"
```

### Task 5.5: Cache-Control headers

**Files:**
- Modify: `app/routes/api.businesses.ts`
- Modify: `app/routes/dashboard.tsx`
- Modify: `app/routes/businesses.$id.tsx`
- Modify: `app/routes/api.businesses.$id.notes.ts`
- Modify: `app/routes/api.businesses.$id.status.ts`

- [ ] **Step 1: Add Cache-Control to GET loaders**

For `api.businesses.ts` and `dashboard.tsx`, change `return Response.json(...)` to:
```ts
return Response.json({ businesses }, {
  headers: { "Cache-Control": "private, max-age=10" },
});
```

For `businesses.$id.tsx`: page loaders use `return { data }` (not Response.json), so Cache-Control doesn't apply the same way. Skip.

- [ ] **Step 2: Add Cache-Control to mutation actions**

For POST, PATCH, DELETE responses in `api.businesses.$id.notes.ts` and `api.businesses.$id.status.ts`:
```ts
return Response.json(data, {
  headers: { "Cache-Control": "no-store" },
});
```

- [ ] **Step 3: Commit**

```bash
git add app/routes/api.businesses.ts app/routes/dashboard.tsx app/routes/api.businesses.$id.notes.ts app/routes/api.businesses.$id.status.ts
git commit -m "perf: add Cache-Control headers to API responses"
```

### Task 5.6: Verify PR5

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

---

## PR6: Client performance & UX

### Task 6.1: Remove redundant useSession() call

**Files:**
- Modify: `app/routes/app-layout.tsx`

- [ ] **Step 1: Remove useSession and authClient import**

Remove import `authClient` (if still there from Task 4.1 — it was removed already):
```tsx
// Remove this line if present:
import { authClient } from "~/lib/auth-client";
```

Remove the `useSession` call (line 27):
```tsx
// Remove:
  const { data: session } = authClient.useSession();
```

After Task 4.1, `currentUser` already uses only `loaderData.user`. Ensure `handleSignOut` still references `authClient`:
```tsx
const handleSignOut = useCallback(() => {
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => { window.location.href = ROUTES.login.path; },
    },
  });
}, []);
```

If `authClient` import was removed in Task 4.1 but `handleSignOut` still needs it, keep the import. Only remove `useSession`.

- [ ] **Step 2: Commit**

```bash
git add app/routes/app-layout.tsx
git commit -m "perf: remove redundant client-side useSession call"
```

### Task 6.2: Memoize NoteItem

**Files:**
- Modify: `app/features/business-detail/components/notes-section.tsx`

- [ ] **Step 1: Add memo import**

Change line 1:
```tsx
// Before:
import { useState } from "react";
// After:
import { useState, memo } from "react";
```

- [ ] **Step 2: Wrap NoteItem in memo**

Find the `NoteItem` function definition and wrap it:
```tsx
// Before:
function NoteItem({ note, ... }: NoteItemProps) {
// After:
const NoteItem = memo(function NoteItem({ note, currentUserEmail, onEdit, onDelete, isEditing, editContent, onEditChange, onEditSave, editNoteId, noteFetcher }: NoteItemProps) {
```

Add closing `)` for memo and export at the bottom of the component:
```tsx
});
```

**Note:** The exact prop names depend on the current code. Read the current `NoteItemProps` interface and `NoteItem` function to get the exact signature before editing.

- [ ] **Step 3: Commit**

```bash
git add app/features/business-detail/components/notes-section.tsx
git commit -m "perf: memoize NoteItem to prevent list re-renders"
```

### Task 6.3: Optimize review images

**Files:**
- Modify: `app/features/business-detail/components/review-images.tsx:22-28`

- [ ] **Step 1: Add width, height, sizes, loading attributes**

Replace the `<img>` tag:
```tsx
// Before:
              <img
                src={url}
                alt={`Ảnh ${i + 1}`}
                className="w-full aspect-square object-cover rounded-md border hover:opacity-80 transition-opacity"
                loading="lazy"
              />
// After:
              <img
                src={url}
                alt={`Ảnh ${i + 1}`}
                width={300}
                height={300}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full aspect-square object-cover rounded-md border hover:opacity-80 transition-opacity"
                loading="lazy"
              />
```

- [ ] **Step 2: Commit**

```bash
git add app/features/business-detail/components/review-images.tsx
git commit -m "perf: add width/height/sizes to review images for LCP stability"
```

### Task 6.4: Non-blocking font loading

**Files:**
- Modify: `app/root.tsx:23-27`

- [ ] **Step 1: Add media=print onload pattern**

Replace the Google Fonts link (the last element in the links array):
```tsx
// Before:
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
// After:
  {
    rel: "preload",
    as: "style",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    media: "print",
    // @ts-expect-error: onload for non-blocking CSS
    onLoad: "this.media='all'",
  },
```

- [ ] **Step 2: Add noscript fallback in Layout**

In the `<head>` of the `Layout` function, add after `<Links />`:
```tsx
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          />
        </noscript>
```

- [ ] **Step 3: Commit**

```bash
git add app/root.tsx
git commit -m "perf: use non-blocking font loading with preload + media=print pattern"
```

### Task 6.5: Fix filter-bar useEffect sync loop

**Files:**
- Modify: `app/features/dashboard/components/filter-bar.tsx:36-39`
- Modify: `app/features/dashboard/components/dashboard-template.tsx`

- [ ] **Step 1: Remove the useEffect**

Remove lines 36-39:
```tsx
// Remove:
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setRegion(searchParams.get("region") || "");
  }, [searchParams]);
```

- [ ] **Step 2: Clean up unused useEffect import**

If no other `useEffect` in the file, remove from import (line 1):
```tsx
// Before:
import { useEffect, useState } from "react";
// After:
import { useState } from "react";
```

- [ ] **Step 3: Add key prop to FilterBar in dashboard-template.tsx**

```tsx
// Before:
      <FilterBar />
// After:
      <FilterBar key={JSON.stringify([page, pageSize])} />
```

This ensures FilterBar re-mounts (resetting local state) when navigation changes the URL externally.

- [ ] **Step 4: Commit**

```bash
git add app/features/dashboard/components/filter-bar.tsx app/features/dashboard/components/dashboard-template.tsx
git commit -m "fix: remove useEffect sync loop from filter-bar, use key prop remount"
```

### Task 6.6: Notes character count

**Files:**
- Modify: `app/features/business-detail/components/notes-section.tsx`

- [ ] **Step 1: Add maxLength and character counter to textarea**

Find the textarea in the note input form and add attributes:
```tsx
// Add maxLength to textarea:
<textarea
  maxLength={5000}
  // ... existing props
/>

// Add character counter near the textarea (show when <500 chars remaining):
{content.length > 4500 && (
  <span className="text-xs text-muted-foreground">
    {5000 - content.length} ký tự còn lại
  </span>
)}
```

- [ ] **Step 2: Commit**

```bash
git add app/features/business-detail/components/notes-section.tsx
git commit -m "feat: add character count to notes textarea"
```

### Task 6.7: Fix AdminSidebar memo effectiveness

This is addressed by Task 4.1 (keeping `useCallback` on `handleSignOut`) and Task 6.1 (using stable `loaderData.user` for `currentUser`). No additional changes needed beyond those tasks.

### Task 6.8: Verify PR6

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```
Expected: No errors.

- [ ] **Step 2: Run build**

```bash
pnpm run build
```
Expected: Build succeeds.

---

## Final verification

- [ ] **Step 1: Run full typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 2: Run production build**

```bash
pnpm run build
```

- [ ] **Step 3: Start dev server and smoke test**

```bash
pnpm run dev
```

Verify:
- Dashboard page loads with business list
- Filter bar works (search + region filter)
- Business detail page loads
- Notes CRUD works
- Status pipeline works (rejected is now terminal/disabled)
- Invite page accessible
- No console errors
