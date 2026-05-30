import { Link } from "react-router";
import type { BusinessDashboardRow } from "~/shared/types";
import { STATUS_MAP } from "~/shared/constants";
import { formatZaloPhone } from "~/shared/utils";
import { Badge, Button, Tooltip } from "~/shared/components";
import type { DataTableColumn } from "~/shared/components/data-table";
import { ExternalLinkIcon } from "~/shared/icons";
import { ROUTES } from "~/shared/constants";

export const columns: DataTableColumn<BusinessDashboardRow>[] = [
  {
    id: "business_name",
    header: "Tên Doanh Nghiệp",
    cell: (b) => (
      <div className="space-y-1">
        <Tooltip content={b.business_name}>
          <Link
            to={ROUTES.businessDetail.buildPath(b.id)}
            className="text-primary block max-w-[240px] truncate font-semibold hover:underline md:max-w-[320px]"
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
    cell: (b) => b.phone || "-",
    cellClassName: "text-muted-foreground",
  },
  {
    id: "address",
    header: "Địa Chỉ",
    cell: (b) => (
      <Tooltip content={b.address}>
        <p className="text-muted-foreground max-w-3xs truncate text-sm">{b.address || "-"}</p>
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
          <Link
            to={ROUTES.businessDetail.buildPath(b.id)}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-medium transition-colors"
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
          <a href={b.maps_url} target="_blank" rel="noopener noreferrer" title="Xem trên Maps">
            <Button variant="ghost" size="icon">
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </a>
        </div>
      );
    },
    align: "right",
  },
];
