import { Badge } from "../ui/badge";

type RatingBadgeProps = {
  rating: null | number;
  size?: "md" | "sm";
};

export function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  const num = toNum(rating);
  if (num == null) return null;
  const variant = num >= 4.5 ? "success" : num >= 4 ? "info" : "warning";
  return (
    <Badge aria-label={`Đánh giá ${num.toFixed(1)} trên 5 sao`} size={size} variant={variant}>
      {num.toFixed(1)}
    </Badge>
  );
}

function toNum(v: unknown): null | number {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
