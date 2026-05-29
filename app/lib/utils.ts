import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ROUTES } from "~/lib/routes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts a string search parameter.
 */
export function getStringParam(
  url: URL | string,
  key: string,
  defaultValue = "",
  maxLength?: number,
): string {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const value = searchParams.get(key) || defaultValue;
  return maxLength && value.length > maxLength ? value.slice(0, maxLength) : value;
}

/**
 * Safely extracts an integer search parameter with optional min/max boundaries.
 */
export function getIntParam(
  url: URL | string,
  key: string,
  defaultValue: number,
  options?: { min?: number; max?: number },
): number {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const val = Number.parseInt(searchParams.get(key) ?? "", 10);

  if (Number.isNaN(val)) return defaultValue;
  if (options?.min !== undefined && val < options.min) return options.min;
  if (options?.max !== undefined && val > options.max) return options.max;

  return val;
}

/**
 * Generates the list of page numbers (with ellipsis) to render in a pagination control.
 *
 * @param currentPage  - The currently active page (1-indexed).
 * @param totalPages   - The total number of pages.
 * @returns An array of page numbers and "..." strings for ellipsis gaps.
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return pages;
}

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
