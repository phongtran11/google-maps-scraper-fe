export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export type RouteMatch = {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  loaderData: unknown;
  handle?: unknown;
};

export type GroupedDistrict = {
  id: number;
  name: string;
  wards: { id: number; name: string }[];
};

export type AwaitedReturn<T extends (...args: unknown[]) => unknown> = Awaited<ReturnType<T>>;
