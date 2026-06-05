import { eq } from "drizzle-orm";

import { db } from "./db.server";
import { districts, wards } from "./schema.server";

export async function getDistrictsWithWard() {
  return db
    .select()
    .from(districts)
    .innerJoin(wards, eq(districts.id, wards.districtId))
    .orderBy(districts.name);
}
