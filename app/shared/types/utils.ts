// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AwaitedReturn<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>;

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export type GroupedDistrict = {
  id: number;
  name: string;
  wards: { id: number; name: string }[];
};
export type RouteMatch = {
  handle?: unknown;
  id: string;
  loaderData: unknown;
  params: Record<string, string | undefined>;
  pathname: string;
};
