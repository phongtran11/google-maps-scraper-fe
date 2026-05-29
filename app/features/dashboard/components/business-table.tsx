import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { STATUS_MAP, REGIONS } from "~/lib/constants";
import { formatZaloPhone } from "~/lib/format";
import {
  Badge,
  Button,
  DataTable,
  Pagination,
  Tooltip,
} from "~/shared/components";
import type { DataTableColumn } from "~/shared/components/data-table";
import { ExternalLinkIcon } from "~/shared/icons";
import { ROUTES } from "~/lib/routes";

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

  const columns = useMemo<DataTableColumn<BusinessRow>[]>(
    () => [
      {
        id: "name",
        header: "Tên Doanh Nghiệp",
        cell: (b) => (
          <div className="space-y-1">
            <Tooltip content={b.business_name}>
              <Link
                to={ROUTES.businessDetail.buildPath(b.id)}
                className="text-primary font-semibold hover:underline block max-w-[240px] md:max-w-[320px] truncate"
              >
                {b.business_name}
              </Link>
            </Tooltip>
          </div>
        ),
        cellClassName: "font-medium",
      },
      {
        id: "phone",
        header: "Số Điện Thoại",
        accessor: "phone",
        cellClassName: "text-muted-foreground",
      },
      {
        id: "address",
        header: "Địa Chỉ",
        cell: (b) => (
          <Tooltip content={b.address}>
            <p className="text-sm text-muted-foreground truncate max-w-3xs">
              {b.address || "-"}
            </p>
          </Tooltip>
        ),
      },
      {
        id: "status",
        header: "Trạng Thái",
        cell: (b) => {
          const s = STATUS_MAP[b.status ?? "new"] ?? {
            label: b.status ?? "Mới",
            variant: "secondary",
          };
          return (
            <Badge variant={s.variant} size="md">
              {s.label}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao Tác",
        cell: (b) => {
          const zaloPhone = formatZaloPhone(b.phone);
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link to={ROUTES.businessDetail.buildPath(b.id)}>
                <Button variant="outline" size="sm">
                  Chi tiết
                </Button>
              </Link>
              {zaloPhone ? (
                <a
                  href={`https://zalo.me/${zaloPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Nhắn tin Zalo"
                >
                  <Button variant="outline" size="sm">
                    Zalo
                  </Button>
                </a>
              ) : (
                <Button variant="ghost" disabled size="sm">
                  Zalo
                </Button>
              )}
              <a
                href={b.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Xem trên Maps"
              >
                <Button variant="ghost" size="icon">
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </a>
            </div>
          );
        },
        align: "right",
      },
    ],
    [],
  );

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
