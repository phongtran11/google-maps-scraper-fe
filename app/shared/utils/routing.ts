import type { BreadcrumbItem, RouteMatch } from "~/shared/types";

/**
 * Collects breadcrumbs from route matches that have a `handle.breadcrumb` function.
 * Each breadcrumb's label is resolved by calling the handle function with the route's loader data.
 * The last breadcrumb is rendered as plain text (no link) since it represents the current page.
 */
export function collectBreadcrumbs(matches: RouteMatch[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  for (const match of matches) {
    if (match.handle?.breadcrumb) {
      const label = match.handle.breadcrumb(match.loaderData);
      breadcrumbs.push({ label, to: match.pathname });
    }
  }

  // The last breadcrumb should not be a link (current page)
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1] = {
      label: breadcrumbs[breadcrumbs.length - 1].label,
    };
  }

  return breadcrumbs;
}
