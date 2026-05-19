import { Pool, neon } from "@neondatabase/serverless";
import type { BusinessRow } from "./types";

export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function getBusinesses({
  limit = 20,
  offset = 0,
  area = "",
}: {
  limit?: number;
  offset?: number;
  area?: string;
} = {}): Promise<BusinessRow[]> {
  const params: (number | string)[] = [limit, offset];

  if (area) {
    params.push(`%${area}%`);
  }

  const result = await sql.query(
    `SELECT * FROM businesses ${area ? "WHERE address ILIKE $3" : ""} LIMIT $1 OFFSET $2`,
    params,
  );

  return result as BusinessRow[];
}
