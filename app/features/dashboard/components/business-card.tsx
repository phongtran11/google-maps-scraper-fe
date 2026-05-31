import { Link } from "react-router";
import type { BusinessRow } from "~/shared/types";
import { STATUS_MAP } from "~/shared/constants";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from "~/shared/components";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { ROUTES } from "~/shared/constants";

interface BusinessCardProps {
  business: BusinessRow;
}

export function BusinessCard({ business: b }: BusinessCardProps) {
  const s = STATUS_MAP[b.status ?? "new"] ?? {
    label: b.status ?? "Mới",
    variant: "secondary" as const,
  };

  return (
    <Link to={ROUTES.businessDetail.buildPath(b.id)} className="group block">
      <Card
        variant="elevated"
        className="flex h-full flex-col transition-shadow group-hover:shadow-xl"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary line-clamp-2 text-base transition-colors">
              {b.business_name}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant={s.variant} size="sm">
                {s.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {b.address && <p className="text-muted-foreground text-sm">{b.address}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {b.phone && <span className="text-muted-foreground text-sm">{b.phone}</span>}
            {b.review_count != null && (
              <span className="text-muted-foreground text-sm">{b.review_count} đánh giá</span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(b.maps_url, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                window.open(b.maps_url, "_blank", "noopener,noreferrer");
              }
            }}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Xem trên Maps
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
