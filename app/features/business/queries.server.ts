import { and, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

import type { AwaitedReturn } from "~/shared/types";

import { db } from "~/server/database/db.server";
import { businesses, businessNotes } from "~/server/database/schema.server";

// ── Types ──────────────────────────────────────────────────────────

export type BusinessRow = typeof businesses.$inferSelect;

export type CheckBusinessExistsResult = AwaitedReturn<typeof checkBusinessExists>;
export type GetBusinessByIdResult = AwaitedReturn<typeof getBusinessById>;
export type GetBusinessesCountResult = AwaitedReturn<typeof getBusinessesCount>;
export type GetBusinessesResult = AwaitedReturn<typeof getBusinesses>[number];
export type GetBusinessNoteResult = AwaitedReturn<typeof getBusinessNote>;
export type GetBusinessNotesResult = AwaitedReturn<typeof getBusinessNotes>[number];

/** Single note row — matches the columns returned by queries & mutations. */
export type NoteRow = GetBusinessNotesResult;

// ── Select Schemas ─────────────────────────────────────────────────

/** Columns needed by BusinessTable (dashboard + businesses list) */
const businessListColumns = {
  id: businesses.id,
  businessName: businesses.businessName,
  phone: businesses.phone,
  address: businesses.address,
  status: businesses.status,
  mapsUrl: businesses.mapsUrl,
} as const;

/** Columns needed by BusinessDetail page (detail + sidebar + status) */
const businessDetailColumns = {
  id: businesses.id,
  businessName: businesses.businessName,
  address: businesses.address,
  phone: businesses.phone,
  website: businesses.website,
  region: businesses.region,
  mapsUrl: businesses.mapsUrl,
  status: businesses.status,
} as const;

/** Columns needed by NoteItem (notes section) */
const noteColumns = {
  id: businessNotes.id,
  businessId: businessNotes.businessId,
  content: businessNotes.content,
  createdAt: businessNotes.createdAt,
  createdBy: businessNotes.createdBy,
  updatedAt: businessNotes.updatedAt,
} as const;

// ── Queries ──────────────────────────────────────────────────────────

export async function checkBusinessExists(id: number): Promise<boolean> {
  const result = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  return result.length > 0;
}

export async function getBusinessById(id: number) {
  const result = await db
    .select(businessDetailColumns)
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBusinesses({
  limit,
  offset,
  region,
  search,
  status,
  wardIds,
}: {
  limit: number;
  offset: number;
  region?: string;
  search?: string;
  status?: string;
  wardIds?: number[];
}) {
  const conditions = buildConditions({ region, search, status, wardIds });

  const query = db
    .select(businessListColumns)
    .from(businesses)
    .orderBy(desc(businesses.imageReviewCount))
    .limit(limit)
    .offset(offset);

  if (conditions) {
    query.where(conditions);
  }

  const result = await query;
  return result;
}

export async function getBusinessesCount({
  region,
  search,
  status,
  wardIds,
}: {
  region?: string;
  search?: string;
  status?: string;
  wardIds?: number[];
} = {}): Promise<number> {
  const conditions = buildConditions({ region, search, status, wardIds });

  if (!conditions) {
    const result = await db.execute<{ count: string }>(
      sql<string>`SELECT reltuples::bigint AS count FROM pg_class WHERE relname = 'businesses'`,
    );
    return Number(result.rows[0]?.count) || 0;
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses)
    .where(conditions);

  return result[0]?.count ?? 0;
}

export async function getBusinessNote(noteId: number) {
  const result = await db
    .select(noteColumns)
    .from(businessNotes)
    .where(and(eq(businessNotes.id, noteId), isNull(businessNotes.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBusinessNotes(businessId: number, limit = 50, offset = 0) {
  const result = await db
    .select(noteColumns)
    .from(businessNotes)
    .where(and(eq(businessNotes.businessId, businessId), isNull(businessNotes.deletedAt)))
    .orderBy(desc(businessNotes.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────

function buildConditions({
  region,
  search,
  status,
  wardIds,
}: {
  region?: string;
  search?: string;
  status?: string;
  wardIds?: number[];
}): ReturnType<typeof and> | undefined {
  const conditions = [];

  if (region) conditions.push(eq(businesses.region, region));
  if (search) conditions.push(ilike(businesses.businessName, `%${search}%`));
  if (status) conditions.push(eq(businesses.status, status));
  if (wardIds?.length) conditions.push(inArray(businesses.wardId, wardIds));

  return conditions.length > 0 ? and(...conditions) : undefined;
}
