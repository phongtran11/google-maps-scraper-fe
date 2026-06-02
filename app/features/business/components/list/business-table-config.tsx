import { Link } from "react-router";

import type { DataTableColumn } from "~/shared/components";

import { Badge, Button, Tooltip } from "~/shared/components";
import { ROUTES } from "~/shared/constants";
import { ExternalLinkIcon } from "~/shared/icons";
import { formatZaloPhone } from "~/shared/utils";

import type { GetBusinessesResult } from "../../types";

import { STATUS_MAP } from "../../constants";

export const columns: DataTableColumn<GetBusinessesResult>[] = [
  {
    cell: (b) => (
      <div className="space-y-1">
        <Tooltip content={b.business_name}>
          <Link
            className="text-primary block max-w-[240px] truncate font-semibold hover:underline md:max-w-[320px]"
            to={ROUTES.businessDetail.buildPath(b.id)}
          >
            {b.business_name}
          </Link>
        </Tooltip>
      </div>
    ),
    cellClassName: "font-medium",
    header: "Tên Doanh Nghiệp",
    id: "business_name",
  },
  {
    cell: (b) => b.phone || "-",
    cellClassName: "text-muted-foreground",
    header: "Số Điện Thoại",
    id: "phone",
  },
  {
    cell: (b) => (
      <Tooltip content={b.address}>
        <p className="text-muted-foreground max-w-3xs truncate text-sm">{b.address || "-"}</p>
      </Tooltip>
    ),
    header: "Địa Chỉ",
    id: "address",
  },
  {
    cell: (b) => {
      const s = STATUS_MAP[b.status ?? "new"] ?? {
        label: b.status ?? "Mới",
        variant: "secondary",
      };
      return (
        <Badge size="md" variant={s.variant}>
          {s.label}
        </Badge>
      );
    },
    header: "Trạng Thái",
    id: "status",
  },
  {
    align: "right",
    cell: (b) => {
      const zaloPhone = formatZaloPhone(b.phone);
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center rounded-md border px-2.5 text-xs font-medium transition-colors"
            to={ROUTES.businessDetail.buildPath(b.id)}
          >
            Chi tiết
          </Link>
          {zaloPhone ? (
            <a
              href={`https://zalo.me/${zaloPhone}`}
              rel="noopener noreferrer"
              target="_blank"
              title="Nhắn tin Zalo"
            >
              <Button size="sm" variant="outline">
                Zalo
              </Button>
            </a>
          ) : (
            <Button disabled size="sm" variant="ghost">
              Zalo
            </Button>
          )}
          <a href={b.maps_url} rel="noopener noreferrer" target="_blank" title="Xem trên Maps">
            <Button size="icon" variant="ghost">
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </a>
        </div>
      );
    },
    header: "Thao Tác",
    id: "actions",
  },
];
