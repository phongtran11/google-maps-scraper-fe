/**
 * Safely extracts an integer search parameter with optional min/max boundaries.
 */
export function getIntParam(
  url: string | URL,
  key: string,
  defaultValue: number,
  options?: { max?: number; min?: number },
): number {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const val = Number.parseInt(searchParams.get(key) ?? "", 10);

  if (Number.isNaN(val)) return defaultValue;
  if (options?.min !== undefined && val < options.min) return options.min;
  if (options?.max !== undefined && val > options.max) return options.max;

  return val;
}

/**
 * Retrieves an array of integer values from the search parameters of a URL for a given key.
 * Invalid (NaN) values are filtered out. Returns the default value if no valid integers are found.
 *
 * @param url - The URL object or URL string to parse.
 * @param key - The query parameter key.
 * @param defaultValue - The fallback value if no valid integers are found.
 * @returns An array of parsed integers, or the defaultValue.
 */
export function getIntParams(url: string | URL, key: string, defaultValue: number[]): number[] {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const params = searchParams.getAll(key);
  const validParams = params
    .flatMap((param) => (param ? param.split(",") : []))
    .map((param) => Number.parseInt(param, 10))
    .filter((param) => !Number.isNaN(param));

  return validParams.length > 0 ? validParams : defaultValue;
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
 * Returns null if the input is undefined, null, empty, or results in NaN.
 */
export function parseId(id: null | number | string | undefined): null | number {
  if (id == null || id === "") return null;
  const num = typeof id === "string" ? Number.parseInt(id, 10) : id;
  if (Number.isNaN(num)) return null;
  return num;
}
