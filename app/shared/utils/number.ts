/**
 * Safely extracts an integer search parameter with optional min/max boundaries.
 */
export function getIntParam(
  url: URL | string,
  key: string,
  defaultValue: number,
  options?: { min?: number; max?: number },
): number {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const val = Number.parseInt(searchParams.get(key) ?? "", 10);

  if (Number.isNaN(val)) return defaultValue;
  if (options?.min !== undefined && val < options.min) return options.min;
  if (options?.max !== undefined && val > options.max) return options.max;

  return val;
}

/**
 * Generates the list of page numbers (with ellipsis) to render in a pagination control.
 *
 * @param currentPage  - The currently active page (1-indexed).
 * @param totalPages   - The total number of pages.
 * @returns An array of page numbers and "..." strings for ellipsis gaps.
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return pages;
}

/**
 * Safely parses an ID (string or number) into a valid number.
 * Returns null if the result is NaN.
 */
export function parseId(id: string | number): number | null {
  const num = typeof id === "string" ? Number.parseInt(id, 10) : id;
  if (Number.isNaN(num)) return null;
  return num;
}
