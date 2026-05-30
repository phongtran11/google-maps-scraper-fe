/**
 * Safely extracts a string search parameter.
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
