import type { businesses, businessNotes } from "~/server/database/schema.server";
import type { AwaitedReturn } from "~/shared/types";

import type { BUSINESS_STATUS, REGIONS } from "./constants";
import type { getBusinesses, getBusinessNote, getBusinessNotes } from "./queries.server";

export type BusinessFilter = {
  limit?: number;
  offset?: number;
  region?: string;
  search?: string;
  status?: string;
  wardIds?: number[];
};

export type BusinessRow = typeof businesses.$inferSelect;

export type BusinessStatus = (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];

export type NoteRow = typeof businessNotes.$inferSelect;

export type Region = keyof typeof REGIONS;

export type GetBusinessesResult = AwaitedReturn<typeof getBusinesses>[number];

export type GetBusinessNotesResult = AwaitedReturn<typeof getBusinessNotes>[number];

export type GetBusinessNoteResult = AwaitedReturn<typeof getBusinessNote>;
