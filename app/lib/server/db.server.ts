import { Pool, neon } from "@neondatabase/serverless";
import type { BusinessRow } from "../types";

export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

const sqlRaw = neon(process.env.NEON_DATABASE_URL!);

// Helper for executing queries with standardized logging
async function logQuery<T>(
  label: string,
  queryText: string,
  params: any[] | undefined,
  executor: () => any,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await executor();
    console.log(
      `${label} Query: ${queryText.trim()} - PARAMS: ${JSON.stringify(params)} - TIME: ${(performance.now() - start).toFixed(2)}ms`,
    );
    return result;
  } catch (err) {
    console.error(`❌ ${label} Error:`, err);
    throw err;
  }
}

const originalPoolQuery = pool.query.bind(pool);
pool.query = async function (queryText: any, values: any, cb?: any) {
  let logText = "";
  let logParams: any[] | undefined = undefined;

  if (typeof queryText === "string") {
    logText = queryText;
    if (Array.isArray(values)) {
      logParams = values;
    }
  } else if (queryText && typeof queryText === "object") {
    logText = queryText.text || "";
    if (Array.isArray(queryText.values)) {
      logParams = queryText.values;
    } else if (Array.isArray(values)) {
      logParams = values;
    }
  }

  return logQuery("Pool", logText || String(queryText), logParams, () =>
    originalPoolQuery(queryText, values, cb),
  );
} as any;

export interface SqlQueryClient {
  (strings: any, ...values: any[]): Promise<any>;
  query(queryText: string, params?: any[]): Promise<any>;
}

// Wrapper for sql tagged template and query methods
export const sql: SqlQueryClient = async function (
  strings: any,
  ...values: any[]
) {
  let query = "";
  let params = values;

  if (Array.isArray(strings)) {
    query = strings.reduce((acc: string, str: string, i: number) => {
      return acc + str + (values[i] !== undefined ? `$${i + 1}` : "");
    }, "");
  } else if (typeof strings === "string") {
    query = strings;
    if (values.length > 0) {
      params = Array.isArray(values[0]) ? values[0] : values;
    }
  }

  return logQuery("SQL", query, params, () => sqlRaw(strings, ...values));
} as any;

sql.query = async function (queryText: string, params?: any[]) {
  return logQuery("SQL", queryText, params, () =>
    sqlRaw.query(queryText, params),
  );
};

interface BusinessFilter {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
}

function buildWhereClause(filter: BusinessFilter): {
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
