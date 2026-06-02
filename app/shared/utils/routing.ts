import { ROUTES } from "~/shared/constants";
import type { BreadcrumbItem, RouteMatch } from "~/shared/types";

/**
 * Generates an array of breadcrumb items based on the active path and route matches.
 *
 * @param pathname - The current URL path.
 * @param matches - React Router route match objects containing route data.
 * @returns An array of BreadcrumbItem elements representing the hierarchy.
 */
export function getBreadcrumbs(pathname: string, matches: RouteMatch[]): BreadcrumbItem[] {
  const isRoot = pathname === ROUTES.dashboard.path;
  const breadcrumbs: BreadcrumbItem[] = [];

  if (isRoot) {
    breadcrumbs.push({ label: ROUTES.dashboard.label });
  } else if (ROUTES.businessDetail.pattern.test(pathname)) {
    const detailMatch = matches.find((m) => m.id === ROUTES.businessDetail.matchId);
    const businessName = (
      detailMatch?.loaderData as { business?: { business_name?: string } } | undefined
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
