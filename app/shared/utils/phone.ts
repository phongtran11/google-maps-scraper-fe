/**
 * Formats a phone number for Zalo compatibility (converts leading 0 to country code 84).
 * (e.g., "0987654321" -> "84987654321").
 *
 * @param phone - The raw phone number string, or null.
 * @returns The formatted phone number, or null if empty or invalid.
 */
export function formatZaloPhone(phone: null | string): null | string {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return "84" + digits.slice(1);
  if (digits.startsWith("84")) return digits;
  return "84" + digits;
}
