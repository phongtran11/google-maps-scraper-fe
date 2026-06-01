import type { businesses,businessNotes } from "~/server/database/schema.server";
import type { AwaitedReturn } from "~/shared/types";

import type { BUSINESS_STATUS, REGIONS } from "./constants";
import { getBusinesses } from "./queries.server";

export type BusinessRow = typeof businesses.$inferSelect;

export interface BusinessFilter {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
  wardId?: string | string[];
}

export type BusinessStatus = (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];

export type Region = keyof typeof REGIONS;

export type NoteRow = typeof businessNotes.$inferSelect;

export type GetBusinessesResult = AwaitedReturn<typeof getBusinesses>[number];
