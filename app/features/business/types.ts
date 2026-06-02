import type { businessNotes, businesses } from "~/server/database/schema.server";

import type { BUSINESS_STATUS, REGIONS } from "./constants";
import type { getBusinesses } from "./queries.server";

export type BusinessRow = typeof businesses.$inferSelect;

export type BusinessFilter = {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
  wardIds?: number[];
};

export type BusinessStatus = (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];

export type Region = keyof typeof REGIONS;

export type NoteRow = typeof businessNotes.$inferSelect;

export type GetBusinessesResult = Awaited<ReturnType<typeof getBusinesses>>[number];
