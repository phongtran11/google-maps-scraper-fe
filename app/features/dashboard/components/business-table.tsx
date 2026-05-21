import { Link, useSearchParams } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { STATUS_MAP } from "~/lib/constants";
import { formatZaloPhone } from "~/lib/format";
import { Badge } from "~/shared/components/badge";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { Button } from "~/shared/components/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/shared/components/table";

export interface BusinessTableProps {
  businesses: BusinessRow[];
}

export function BusinessTable({ businesses }: BusinessTableProps) {
  const [searchParams] = useSearchParams();
  const area = searchParams.get("area") || "";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Tên Doanh Nghiệp</TableHead>
          <TableHead className="font-semibold">Số Điện Thoại</TableHead>
          <TableHead className="font-semibold">Địa Chỉ</TableHead>
          <TableHead className="font-semibold">Trạng Thái</TableHead>
          <TableHead className="font-semibold text-right">Thao Tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((b) => {
          const s = STATUS_MAP[b.status ?? "new"] ?? {
            label: b.status ?? "Mới",
            variant: "secondary" as const,
          };
          const zaloPhone = formatZaloPhone(b.phone);

          return (
            <TableRow key={b.id}>
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <Link
                    to={`/businesses/${b.id}`}
                    className="text-primary font-semibold hover:underline block max-w-[240px] md:max-w-[320px] truncate"
                  >
                    {b.business_name}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {b.phone || "-"}
              </TableCell>
              <TableCell>
                <p
                  className="text-sm text-muted-foreground truncate max-w-3xs"
                  title={b.address || ""}
                >
                  {b.address || "-"}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={s.variant} size="md">
                  {s.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    to={`/businesses/${b.id}`}
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
              </TableCell>
            </TableRow>
          );
        })}

        {businesses.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-12 text-muted-foreground"
            >
              {area
                ? `Không có doanh nghiệp nào tại ${area}.`
                : "Chưa có doanh nghiệp nào được thu thập."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
