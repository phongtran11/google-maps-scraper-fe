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
  url: URL | string,
  key: string,
  defaultValue = "",
  maxLength?: number,
): string {
  const searchParams = typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const value = searchParams.get(key) || defaultValue;
  return maxLength && value.length > maxLength ? value.slice(0, maxLength) : value;
}
