import { ChevronLeftIcon } from "~/shared/icons/chevron-left";
import { ChevronRightIcon } from "~/shared/icons/chevron-right";
import { cn, getPageNumbers } from "~/shared/utils";

import { ButtonLink } from "../atoms";
import { Select } from "../atoms/select";

export interface PaginationProps {
  /** Returns the URL/href for a given page number. */
  getPageUrl: (page: number) => string;
  /** Called when the user selects a new page size. Should navigate/reset to page 1. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Currently active page (1-indexed). */
  page: number;
  /** Number of records per page (used for the summary label). */
  pageSize: number;
  /** Available page size options. When provided, a dropdown is rendered. */
  pageSizeOptions?: number[];
  /** Total number of records (used for the summary label). */
  totalCount: number;
  /** Total number of pages. */
  totalPages: number;
}

export function Pagination({
  getPageUrl,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  totalCount,
  totalPages,
}: PaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  if (totalPages <= 1 && (!pageSizeOptions || !onPageSizeChange)) {
    return null;
  }

  const rangeFrom = totalCount === 0 ? 0 : Math.min((page - 1) * pageSize + 1, totalCount);
  const rangeTo = Math.min(page * pageSize, totalCount);

  return (
    <nav
      aria-label="Phân trang"
      className="border-border bg-muted/20 flex flex-col items-center gap-3 border-t px-4 py-4 sm:flex-row sm:justify-between"
    >
      {/* Summary label + page-size selector */}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">
          Hiển thị <span className="text-foreground font-medium">{rangeFrom}</span> đến{" "}
          <span className="text-foreground font-medium">{rangeTo}</span> trong số{" "}
          <span className="text-foreground font-medium">{totalCount}</span> bản ghi
        </span>
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <Select
              aria-label="Số dòng mỗi trang"
              onChange={(v) => onPageSizeChange(Number(v))}
              options={pageSizeOptions.map((n) => ({
                key: String(n),
                label: String(n),
              }))}
              selectSize="sm"
              value={String(pageSize)}
            />
          </div>
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <ButtonLink
          aria-label="Trang trước"
          className={cn("text-muted-foreground", page <= 1 && "pointer-events-none opacity-40")}
          size="xs"
          to={page > 1 ? getPageUrl(page - 1) : "#"}
          variant="outline"
        >
          <ChevronLeftIcon />
        </ButtonLink>

        {/* Page numbers */}
        {pageNumbers.map((num, idx) => {
          if (num === "...") {
            return (
              <span
                className="text-muted-foreground inline-flex h-8 w-8 items-center justify-center text-sm"
                key={`ellipsis-${idx}`}
              >
                ...
              </span>
            );
          }

          const isActive = num === page;
          return (
            <ButtonLink
              key={`page-${num}`}
              size="xs"
              to={getPageUrl(num as number)}
              variant={isActive ? "default" : "outline"}
            >
              {num}
            </ButtonLink>
          );
        })}

        {/* Next */}
        <ButtonLink
          aria-label="Trang sau"
          className={cn(
            "text-muted-foreground",
            page >= totalPages && "pointer-events-none opacity-40",
          )}
          size="xs"
          to={page < totalPages ? getPageUrl(page + 1) : "#"}
          variant="outline"
        >
          <ChevronRightIcon />
        </ButtonLink>
      </div>
    </nav>
  );
}
