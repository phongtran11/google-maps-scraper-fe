import { Link } from "react-router";
import { getPageNumbers } from "~/shared/lib/pagination";
import { ChevronLeftIcon } from "~/shared/icons/chevron-left";
import { ChevronRightIcon } from "~/shared/icons/chevron-right";

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
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  getPageUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);
  const rangeFrom = Math.min((page - 1) * pageSize + 1, totalCount);
  const rangeTo = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-4 bg-muted/20">
      {/* Summary label */}
      <div className="text-sm text-muted-foreground">
        Hiển thị{" "}
        <span className="font-medium text-foreground">{rangeFrom}</span>{" "}
        đến{" "}
        <span className="font-medium text-foreground">{rangeTo}</span>{" "}
        trong số{" "}
        <span className="font-medium text-foreground">{totalCount}</span>{" "}
        doanh nghiệp
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Link
          to={page > 1 ? getPageUrl(page - 1) : "#"}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
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
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
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
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors border ${
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
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
            page >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
          title="Trang sau"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
