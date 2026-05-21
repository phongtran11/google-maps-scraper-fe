import type { BusinessRow } from "~/lib/types";
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
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trang quản trị</h2>
      </div>

      <FilterBar />

      <BusinessTable
        businesses={businesses}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
