import { useSearchParams } from "react-router";

import type { GroupedDistrict } from "~/shared/types";

import { DataTable, Pagination } from "~/shared/components";
import { getStringParams } from "~/shared/utils";

import type { GetBusinessesResult } from "../../queries.server";

import { columns } from "./business-table-config";

export interface BusinessTableProps {
  businesses: GetBusinessesResult[];
  districtsWithWard: GroupedDistrict[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export function BusinessTable({
  businesses,
  districtsWithWard,
  page,
  pageSize,
  totalCount,
}: BusinessTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const wardIds = getStringParams(searchParams, "wardId");

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
    <div>
      <DataTable
        columns={columns}
        data={businesses}
        emptyMessage={emptyMessage}
        keyExtractor={(b) => b.id}
        stickyHeader={true}
      />
      <Pagination
        getPageUrl={getPageUrl}
        onPageSizeChange={onPageSizeChange}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </div>
  );
}
