export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface RouteMatch {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  loaderData: unknown;
  handle?: unknown;
}

export interface GroupedDistrict {
  id: number;
  name: string;
  wards: { id: number; name: string }[];
}
