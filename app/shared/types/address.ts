import type { districts, wards } from "~/server/database/schema.server";

export type DistrictRow = typeof districts.$inferSelect;
export type WardRow = typeof wards.$inferSelect;
