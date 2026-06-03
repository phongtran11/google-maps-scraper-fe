import { eq } from "drizzle-orm";

import { db } from "./db.server";
import { wards } from "./schema.server";

export async function getWardById(id: number) {
  const result = await db.select().from(wards).where(eq(wards.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getWards() {
  return db.select().from(wards).orderBy(wards.name);
}

export async function getWardsByDistrictId(districtId: number) {
  return db.select().from(wards).where(eq(wards.districtId, districtId)).orderBy(wards.name);
}
