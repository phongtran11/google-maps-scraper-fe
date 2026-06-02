import { and, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

import { db } from "~/server/database/db.server";
import { businessNotes, businesses } from "~/server/database/schema.server";
import { parseId } from "~/shared/utils";

import { REGIONS, STATUS_MAP } from "./constants";
import type { BusinessFilter } from "./types";

export function buildConditions(filter: BusinessFilter) {
  const conditions = [];

  if (filter.region && REGIONS[filter.region as keyof typeof REGIONS]) {
    conditions.push(eq(businesses.region, filter.region));
  }
  if (filter.search) {
    conditions.push(ilike(businesses.business_name, `%${filter.search}%`));
  }
  if (filter.status && STATUS_MAP[filter.status]) {
    conditions.push(eq(businesses.status, filter.status));
  }
  if (filter.wardIds?.length) {
    conditions.push(inArray(businesses.wardId, filter.wardIds));
  }

  return conditions;
}

export async function getBusinesses({
  limit = 20,
  offset = 0,
  region = "",
  search = "",
  status = "",
  wardIds = [],
}: BusinessFilter) {
  const conditions = buildConditions({ region, search, status, wardIds });

  const query = db
    .select({
      id: businesses.id,
      business_name: businesses.business_name,
      phone: businesses.phone,
      address: businesses.address,
      status: businesses.status,
      region: businesses.region,
      rating: businesses.rating,
      maps_url: businesses.mapsUrl,
    })
    .from(businesses)
    .orderBy(desc(businesses.imageReviewCount))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const result = await query;
  return result;
}

export type GetBusinessesResult = Awaited<ReturnType<typeof getBusinesses>>[number];

export async function getBusinessesCount({
  region = "",
  search = "",
  status = "",
  wardIds = [],
}: BusinessFilter): Promise<number> {
  const hasFilters = !!(region || search || status || wardIds.length);

  if (!hasFilters) {
    const result = await db.execute<{ count: string }>(
      sql<string>`SELECT reltuples::bigint AS count FROM pg_class WHERE relname = 'businesses'`,
    );
    return Number(result.rows[0]?.count) || 0;
  }

  const conditions = buildConditions({ region, search, status, wardIds });
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count ?? 0;
}

export async function getBusinessById(id: string | number) {
  const numId = parseId(id);
  if (numId === null) return null;

  const result = await db.select().from(businesses).where(eq(businesses.id, numId)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function checkBusinessExists(id: string | number): Promise<boolean> {
  const numId = parseId(id);
  if (numId === null) return false;

  const result = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.id, numId))
    .limit(1);

  return result.length > 0;
}

export async function getBusinessNotes(businessId: string | number, limit = 50, offset = 0) {
  const id = parseId(businessId);
  if (id === null) throw new Error("Invalid ID");

  const result = await db
    .select()
    .from(businessNotes)
    .where(and(eq(businessNotes.business_id, id), isNull(businessNotes.deleted_at)))
    .orderBy(desc(businessNotes.created_at))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getBusinessNote(noteId: string | number) {
  const id = parseId(noteId);
  if (id === null) throw new Error("Invalid ID");
  const result = await db
    .select()
    .from(businessNotes)
    .where(and(eq(businessNotes.id, id), isNull(businessNotes.deleted_at)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
