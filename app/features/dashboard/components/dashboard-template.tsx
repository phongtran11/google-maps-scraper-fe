import type { BusinessDashboardRow, GroupedDistrict } from "~/shared/types";
import { FilterBar } from "./filter-bar";
import { BusinessTable } from "./business-table";
import { PageHeader } from "~/shared/components";

export interface DashboardTemplateProps {
  businesses: BusinessDashboardRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  districtsWithWard: GroupedDistrict[];
}

export function DashboardTemplate({
  businesses,
  totalCount,
  page,
  pageSize,
  districtsWithWard,
}: DashboardTemplateProps) {
  return (
    <div className="space-y-8">
      <PageHeader title="Trang quản trị" />

      <FilterBar districtsWithWard={districtsWithWard} />

      <BusinessTable
        businesses={businesses}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        districtsWithWard={districtsWithWard}
      />
    </div>
  );
}
