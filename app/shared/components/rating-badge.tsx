import { Badge } from "~/components/atoms/badge";

interface RatingBadgeProps {
  rating: number | null;
  size?: "sm" | "md";
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  const num = toNum(rating);
  if (num == null) return null;
  const variant = num >= 4.5 ? "success" : num >= 4 ? "info" : "warning";
  return (
    <Badge variant={variant} size={size}>
      {num.toFixed(1)}
    </Badge>
  );
}
