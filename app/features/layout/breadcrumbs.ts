import { ROUTES } from "~/lib/routes";

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

export function getBreadcrumbs(
  pathname: string,
  matches: RouteMatch[],
): BreadcrumbItem[] {
  const isRoot = pathname === ROUTES.dashboard.path;
  const breadcrumbs: BreadcrumbItem[] = [];

  if (isRoot) {
    breadcrumbs.push({ label: ROUTES.dashboard.label });
  } else if (ROUTES.businessDetail.pattern.test(pathname)) {
    const detailMatch = matches.find((m) => m.id === ROUTES.businessDetail.matchId);
    const businessName = (
      detailMatch?.loaderData as
        | { business?: { business_name?: string } }
        | undefined
    )?.business?.business_name;
    breadcrumbs.push(
      { label: ROUTES.dashboard.label, to: ROUTES.dashboard.path },
      { label: ROUTES.businessDetail.label(businessName) },
    );
  } else {
    breadcrumbs.push(
      { label: ROUTES.dashboard.label, to: ROUTES.dashboard.path },
      { label: "Chi tiết" },
    );
  }

  return breadcrumbs;
}

