import type { Region } from "~/lib/constants";
import type { BusinessStatus } from "~/shared/constants";

export type BusinessFilter = {
  region?: Region;
  search?: string;
  status?: BusinessStatus;
  limit?: number;
  offset?: number;
};

export type GetBusinesses = {
  id: number;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
  region: string | null;
  rating: number | null;
  mapUrl: string | null;
};

export type GetBusinessesCount = {
  count: number;
};
