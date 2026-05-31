import { Link } from "react-router";
import { getPageNumbers } from "~/shared/utils";
import { ChevronLeftIcon } from "~/shared/icons/chevron-left";
import { ChevronRightIcon } from "~/shared/icons/chevron-right";
import { Select } from "../atoms/select";

export interface PaginationProps {
  /** Currently active page (1-indexed). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of records (used for the summary label). */
  totalCount: number;
  /** Number of records per page (used for the summary label). */
  pageSize: number;
  /** Returns the URL/href for a given page number. */
  getPageUrl: (page: number) => string;
  /** Available page size options. When provided, a dropdown is rendered. */
  pageSizeOptions?: number[];
  /** Called when the user selects a new page size. Should navigate/reset to page 1. */
  onPageSizeChange?: (pageSize: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  getPageUrl,
  pageSizeOptions = [20, 50, 100],
  onPageSizeChange,
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
      className="border-border bg-muted/20 flex items-center justify-between border-t px-4 py-4"
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
              options={pageSizeOptions.map((n) => ({
                key: String(n),
                label: String(n),
              }))}
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
              selectSize="sm"
              aria-label="Số dòng mỗi trang"
            />
          </div>
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Link
          to={page > 1 ? getPageUrl(page - 1) : "#"}
          className={`border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
            page <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
          title="Trang trước"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>

        {/* Page numbers */}
        {pageNumbers.map((num, idx) => {
          if (num === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="text-muted-foreground inline-flex h-8 w-8 items-center justify-center text-sm"
              >
                ...
              </span>
            );
          }

          const isActive = num === page;
          return (
            <Link
              key={`page-${num}`}
              to={getPageUrl(num as number)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {num}
            </Link>
          );
        })}

        {/* Next */}
        <Link
          to={page < totalPages ? getPageUrl(page + 1) : "#"}
          className={`border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
            page >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
          title="Trang sau"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}
