import { eq } from "drizzle-orm";

import { db } from "./db.server";
import { districts, wards } from "./schema.server";

export async function getDistricts() {
  return db.select().from(districts).orderBy(districts.name);
}

export async function getDistrictsWithWard() {
  return db
    .select()
    .from(districts)
    .innerJoin(wards, eq(districts.id, wards.district_id))
    .orderBy(districts.name);
}

export async function getDistrictById(id: number) {
  const result = await db.select().from(districts).where(eq(districts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDistrictByName(name: string) {
  const result = await db.select().from(districts).where(eq(districts.name, name.trim())).limit(1);
  return result.length > 0 ? result[0] : null;
}
