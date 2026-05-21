import { useSearchParams, useRouteLoaderData } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { Pagination } from "~/shared/components/pagination";
import { FilterBar } from "./filter-bar";
import { BusinessTable } from "./business-table";

export interface DashboardTemplateProps {
  businesses: BusinessRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function DashboardTemplate({
  businesses,
  totalCount,
  page,
  pageSize,
}: DashboardTemplateProps) {
  const [searchParams] = useSearchParams();

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trang quản trị</h2>
      </div>

      <FilterBar />

      <BusinessTable businesses={businesses} />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        getPageUrl={getPageUrl}
      />
    </div>
  );
}
