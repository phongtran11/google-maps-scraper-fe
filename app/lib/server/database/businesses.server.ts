import { db } from "./db.server";
import { businesses } from "./schema";
import type { BusinessRow } from "../../types";
import { STATUS_MAP, REGIONS } from "../../constants";
import { eq, ilike, and, desc, sql } from "drizzle-orm";

export interface BusinessFilter {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
}

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

  return conditions;
}

export async function getBusinesses({
  limit = 20,
  offset = 0,
  region = "",
  search = "",
  status = "",
}: BusinessFilter = {}): Promise<BusinessRow[]> {
  const conditions = buildConditions({ region, search, status });

  const query = db
    .select({
      id: businesses.id,
      business_name: businesses.business_name,
      phone: businesses.phone,
      address: businesses.address,
      status: businesses.status,
      region: businesses.region,
      rating: businesses.rating,
    })
    .from(businesses)
    .orderBy(desc(businesses.id))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const result = await query;
  return result as unknown as BusinessRow[];
}

export async function getBusinessesCount({
  region = "",
  search = "",
  status = "",
}: Pick<BusinessFilter, "region" | "search" | "status"> = {}): Promise<number> {
  const hasFilters = !!(region || search || status);

  if (!hasFilters) {
    const result = await db.execute<{ count: string }>(
      sql`SELECT reltuples::bigint AS count FROM pg_class WHERE relname = 'businesses'`
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  const conditions = buildConditions({ region, search, status });
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return Number(result[0]?.count ?? 0);
}

export async function getBusinessById(
  id: string | number,
): Promise<BusinessRow | null> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(numId)) return null;

  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, numId))
    .limit(1);

  return result.length > 0 ? (result[0] as unknown as BusinessRow) : null;
}

export async function checkBusinessExists(
  id: string | number,
): Promise<boolean> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(numId)) return false;

  const result = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.id, numId))
    .limit(1);

  return result.length > 0;
}
