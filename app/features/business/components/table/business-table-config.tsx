import { Link } from "react-router";

import type { DataTableColumn } from "~/shared/components";

import {
  Badge,
  Button,
  buttonBase,
  ButtonLink,
  buttonVariants,
  Tooltip,
} from "~/shared/components";
import { ROUTES } from "~/shared/constants";
import { ExternalLinkIcon } from "~/shared/icons";
import { cn, formatZaloPhone } from "~/shared/utils";

import type { GetBusinessesResult } from "../../queries.server";

import { STATUS_MAP } from "../../constants";

export const columns: DataTableColumn<GetBusinessesResult>[] = [
  {
    cell: (b) => (
      <div className="space-y-1">
        <Tooltip content={b.businessName}>
          <Link
            className="text-primary block max-w-60 truncate font-semibold hover:underline md:max-w-[320px]"
            to={ROUTES.businessDetail.buildPath(b.id)}
          >
            {b.businessName}
          </Link>
        </Tooltip>
      </div>
    ),
    cellClassName: "font-medium",
    header: "Tên Doanh Nghiệp",
    id: "businessName",
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
          <ButtonLink size="sm" to={ROUTES.businessDetail.buildPath(b.id)} variant="outline">
            Chi tiết
          </ButtonLink>
          {zaloPhone ? (
            <a
              className={cn(buttonBase, buttonVariants.size.sm, buttonVariants.variant.outline)}
              href={`https://zalo.me/${zaloPhone}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Zalo
            </a>
          ) : (
            <Button disabled size="sm" variant="ghost">
              Zalo
            </Button>
          )}
          <a
            className={cn(buttonBase, buttonVariants.size.sm, buttonVariants.variant.outline)}
            href={b.mapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </div>
      );
    },
    header: "Thao Tác",
    id: "actions",
  },
];
