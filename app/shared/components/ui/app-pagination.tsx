import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components";

export type AppPaginationProps = {
  getPageUrl: (page: number) => string;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function AppPagination({
  getPageUrl,
  onPageSizeChange,
  page,
  pageSize,
  totalCount,
  totalPages,
}: AppPaginationProps) {
  if (totalCount === 0) return null;

  const renderPageNumbers = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink asChild isActive={page === 1}>
            <Link to={getPageUrl(1)}>1</Link>
          </PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink asChild isActive={page === i}>
            <Link to={getPageUrl(i)}>{i}</Link>
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink asChild isActive={page === totalPages}>
            <Link to={getPageUrl(totalPages)}>{totalPages}</Link>
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Hiển thị</span>
        <Select onValueChange={(v) => onPageSizeChange(Number(v))} value={String(pageSize)}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          trong tổng số <span className="text-foreground font-medium">{totalCount}</span>
        </span>
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            {page > 1 ? (
              <PaginationLink asChild className="pl-1.5!" size="default">
                <Link aria-label="Go to previous page" to={getPageUrl(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:block">Trang trước</span>
                </Link>
              </PaginationLink>
            ) : (
              <PaginationLink
                aria-disabled
                className="pointer-events-none pl-1.5! opacity-50"
                size="default"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:block">Trang trước</span>
              </PaginationLink>
            )}
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            {page < totalPages ? (
              <PaginationLink asChild className="pr-1.5!" size="default">
                <Link aria-label="Go to next page" to={getPageUrl(page + 1)}>
                  <span className="hidden sm:block">Trang sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </PaginationLink>
            ) : (
              <PaginationLink
                aria-disabled
                className="pointer-events-none pr-1.5! opacity-50"
                size="default"
              >
                <span className="hidden sm:block">Trang sau</span>
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
