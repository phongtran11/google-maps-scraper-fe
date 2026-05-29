import { REGIONS, STATUS_MAP, type Region } from "~/lib/constants";
import type { BusinessFilter } from "~/types/dashboard";

export function buildWhereClause(filter: BusinessFilter): {
  where: string;
  params: (string | number)[];
  nextIdx: number;
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  if (filter.region && REGIONS[filter.region]) {
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

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params, nextIdx: idx };
}
