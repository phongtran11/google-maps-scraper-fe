import { useSearchParams } from "react-router";
import type { BusinessDashboardRow, GroupedDistrict } from "~/shared/types";
import { DataTable, Pagination } from "~/shared/components";
import { columns } from "./business-table-config";

export interface BusinessTableProps {
  businesses: BusinessDashboardRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  districtsWithWard: GroupedDistrict[];
}

export function BusinessTable({
  businesses,
  totalCount,
  page,
  pageSize,
  districtsWithWard,
}: BusinessTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const wardIds = searchParams.getAll("wardId");

  let wardLabel = "";
  if (wardIds.length > 0) {
    const labels: string[] = [];
    for (const d of districtsWithWard) {
      for (const w of d.wards) {
        if (wardIds.includes(String(w.id))) {
          labels.push(`${w.name} (${d.name})`);
        }
      }
    }
    if (labels.length > 0) {
      wardLabel = labels.join(", ");
    }
  }

  const emptyMessage = wardLabel
    ? `Không có doanh nghiệp nào tại ${wardLabel}.`
    : "Chưa có doanh nghiệp nào được thu thập.";

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const onPageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", String(newPageSize));
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="space-y-0">
      <DataTable
        data={businesses}
        columns={columns}
        keyExtractor={(b) => b.id}
        emptyMessage={emptyMessage}
        stickyHeader={true}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        getPageUrl={getPageUrl}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
