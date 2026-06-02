/**
 * Formats a date into a human-readable relative time string in Vietnamese.
 * (e.g., "vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước").
 *
 * @param dateInput - The Date object or date-time string to parse.
 * @returns A relative time string.
 */
export function relativeTime(dateInput: string | Date): string {
  const diff = Date.now() - new Date(dateInput).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
