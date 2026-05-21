import { Pool, neon } from "@neondatabase/serverless";
import type { BusinessRow } from "../types";


export const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
});


const sql = neon(process.env.NEON_DATABASE_URL!);

interface BusinessFilter {
    limit?: number;
    offset?: number;
    area?: string;
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

    if (filter.area) {
        conditions.push(`address ILIKE $${idx++}`);
        params.push(`%${filter.area}%`);
    }
    if (filter.search) {
        conditions.push(`business_name ILIKE $${idx++}`);
        params.push(`%${filter.search}%`);
    }
    if (filter.status) {
        conditions.push(`status = $${idx++}`);
        params.push(filter.status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { where, params, nextIdx: idx };
}

export async function getBusinesses({
    limit = 20,
    offset = 0,
    area = "",
    search = "",
    status = "",
}: BusinessFilter = {}): Promise<BusinessRow[]> {
    const { where, params, nextIdx } = buildWhereClause({ area, search, status });
    params.push(limit, offset);

    const result = await sql.query(
        `SELECT * FROM businesses ${where} ORDER BY id DESC LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
        params,
    );

    return result as BusinessRow[];
}

export async function getBusinessesCount({
    area = "",
    search = "",
    status = "",
}: Pick<BusinessFilter, "area" | "search" | "status"> = {}): Promise<number> {
    const { where, params } = buildWhereClause({ area, search, status });

    const result = await sql.query(
        `SELECT COUNT(*) as count FROM businesses ${where}`,
        params,
    );

    return Number((result[0] as { count: string | number }).count);
}
