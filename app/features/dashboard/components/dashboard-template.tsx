import type { BusinessRow } from "~/lib/types";
import { FilterBar } from "./filter-bar";
import { BusinessTable } from "./business-table";
import { PageHeader } from "~/shared/components";

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
      <PageHeader title="Trang quản trị" />

      <FilterBar key={JSON.stringify([page, pageSize])} />

      <BusinessTable
        businesses={businesses}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
