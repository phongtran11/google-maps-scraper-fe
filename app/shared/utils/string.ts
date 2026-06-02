/**
 * Safely extracts a string query parameter from a URL with optional length limits.
 *
 * @param url - The URL object or URL string to parse.
 * @param key - The query parameter key.
 * @param defaultValue - The fallback value if key doesn't exist or is empty.
 * @param maxLength - Optional max length to truncate the string.
 * @returns The parsed string or the defaultValue.
 */
export function getStringParam(
  url: string | URL,
  key: string,
  defaultValue = "",
  maxLength?: number,
): string {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const value = searchParams.get(key) || defaultValue;
  return maxLength && value.length > maxLength ? value.slice(0, maxLength) : value;
}

/**
 * Retrieves an array of string values from the search parameters of a URL for a given key,
 * supporting comma-separated values.
 *
 * @param url - The URL object, URL string, or URLSearchParams to parse.
 * @param key - The query parameter key.
 * @param defaultValue - The fallback value if no valid strings are found.
 * @returns An array of parsed strings, or the defaultValue.
 */
export function getStringParams(
  url: string | URL | URLSearchParams,
  key: string,
  defaultValue: string[] = [],
): string[] {
  const searchParams =
    url instanceof URLSearchParams
      ? url
      : typeof url === "string"
        ? new URL(url).searchParams
        : url.searchParams;
  const params = searchParams.getAll(key);
  const validParams = params.flatMap((param) => (param ? param.split(",") : [])).filter(Boolean);

  return validParams.length > 0 ? validParams : defaultValue;
}
