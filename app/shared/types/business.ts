import type { businesses } from "~/server/database/schema.server";
import type { BUSINESS_STATUS } from "~/shared/constants/businesses.constant";
import type { REGIONS } from "~/shared/constants";

export type BusinessRow = typeof businesses.$inferSelect;

export type BusinessDashboardRow = Pick<
  BusinessRow,
  "id" | "business_name" | "phone" | "address" | "status" | "region" | "rating" | "maps_url"
>;

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
