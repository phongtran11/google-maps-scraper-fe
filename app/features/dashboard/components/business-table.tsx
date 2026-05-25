import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { STATUS_MAP, REGIONS } from "~/lib/constants";
import { formatZaloPhone } from "~/lib/format";
import { Badge } from "~/shared/components/badge";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { Button } from "~/shared/components/button";
import { DataTable } from "~/shared/components/table";
import type { DataTableColumn } from "~/shared/components/table";
import { Tooltip } from "~/shared/components/tooltip";
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
  const [searchParams] = useSearchParams();
  const regionCode = searchParams.get("region") || "";
  const regionLabel = REGIONS[regionCode as keyof typeof REGIONS] || "";

  const emptyMessage = regionLabel
    ? `Không có doanh nghiệp nào tại ${regionLabel}.`
    : "Chưa có doanh nghiệp nào được thu thập.";

  const columns = useMemo<DataTableColumn<BusinessRow>[]>(
    () => [
      {
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
        header: "Số Điện Thoại",
        accessor: "phone",
        cell: (b) => b.phone || "-",
        cellClassName: "text-muted-foreground",
      },
      {
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
        header: "Thao Tác",
        cell: (b) => {
          const zaloPhone = formatZaloPhone(b.phone);
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                to={ROUTES.businessDetail.buildPath(b.id)}
                className="inline-flex h-8 px-2.5 items-center justify-center rounded-md border border-input bg-background text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Chi tiết
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
    <DataTable
      data={businesses}
      columns={columns}
      keyExtractor={(b) => b.id}
      emptyMessage={emptyMessage}
      stickyHeader={true}
      pagination={{
        page,
        totalCount,
        pageSize,
      }}
    />
  );
}
