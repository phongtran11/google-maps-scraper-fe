import { useSearchParams } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { REGIONS } from "~/lib/constants";
import { DataTable, Pagination } from "~/shared/components";
import { columns } from "./business-table-config";

export interface BusinessTableProps {
  businesses: BusinessRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function BusinessTable({
  businesses,
  totalCount,
  page,
  pageSize,
}: BusinessTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const regionCode = searchParams.get("region") || "";
  const regionLabel = REGIONS[regionCode as keyof typeof REGIONS] || "";

  const emptyMessage = regionLabel
    ? `Không có doanh nghiệp nào tại ${regionLabel}.`
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
