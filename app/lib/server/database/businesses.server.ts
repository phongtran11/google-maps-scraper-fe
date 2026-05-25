import { sql } from "./db.server";
import type { BusinessRow } from "../../types";

export interface BusinessFilter {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
}

export function buildWhereClause(filter: BusinessFilter): {
  where: string;
  params: (string | number)[];
  nextIdx: number;
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  if (filter.region) {
    conditions.push(`region = $${idx++}`);
    params.push(filter.region);
  }
  if (filter.search) {
    conditions.push(`business_name ILIKE $${idx++}`);
    params.push(`%${filter.search}%`);
  }
  if (filter.status) {
    conditions.push(`status = $${idx++}`);
    params.push(filter.status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params, nextIdx: idx };
}

export async function getBusinesses({
  limit = 20,
  offset = 0,
  region = "",
  search = "",
  status = "",
}: BusinessFilter = {}): Promise<BusinessRow[]> {
  const { where, params, nextIdx } = buildWhereClause({
    region,
    search,
    status,
  });
  params.push(limit, offset);

  const result = await sql.query(
    `SELECT * FROM businesses ${where} ORDER BY id DESC LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
    params,
  );

  return result as BusinessRow[];
}

export async function getBusinessesCount({
  region = "",
  search = "",
  status = "",
}: Pick<BusinessFilter, "region" | "search" | "status"> = {}): Promise<number> {
  const { where, params } = buildWhereClause({ region, search, status });

  const result = await sql.query(
    `SELECT COUNT(*) as count FROM businesses ${where}`,
    params,
  );

  return Number((result[0] as { count: string | number }).count);
}

export async function getBusinessById(
  id: string | number,
): Promise<BusinessRow | null> {
  const result = await sql.query(`SELECT * FROM businesses WHERE id = $1`, [
    id,
  ]);
  return result.length > 0 ? (result[0] as BusinessRow) : null;
}

export async function checkBusinessExists(
  id: string | number,
): Promise<boolean> {
  const result = await sql.query(`SELECT 1 FROM businesses WHERE id = $1`, [
    id,
  ]);
  return result.length > 0;
}
