export function formatZaloPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return "84" + digits.slice(1);
  if (digits.startsWith("84")) return digits;
  return "84" + digits;
}
