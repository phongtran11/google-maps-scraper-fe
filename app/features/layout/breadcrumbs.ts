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
  const isRoot = pathname === "/";
  const breadcrumbs: BreadcrumbItem[] = [];

  if (isRoot) {
    breadcrumbs.push({ label: "Trang Quản Trị" });
  } else if (pathname.startsWith("/businesses/")) {
    const detailMatch = matches.find((m) => m.id === "routes/businesses.$id");
    const businessName = (
      detailMatch?.loaderData as
        | { business?: { business_name?: string } }
        | undefined
    )?.business?.business_name;
    breadcrumbs.push(
      { label: "Trang Quản Trị", to: "/" },
      { label: businessName || "Chi tiết doanh nghiệp" },
    );
  } else {
    breadcrumbs.push(
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết" },
    );
  }

  return breadcrumbs;
}
