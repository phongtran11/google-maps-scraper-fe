import { Link } from "react-router";

import { Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/shared/components";
import { ROUTES } from "~/shared/constants";
import { ExternalLinkIcon } from "~/shared/icons/external-link";

import type { BusinessRow } from "../../queries.server";

import { STATUS_MAP } from "../../constants";

interface BusinessCardProps {
  business: BusinessRow;
}

export function BusinessCard({ business: b }: BusinessCardProps) {
  const s = STATUS_MAP[b.status ?? "new"] ?? {
    label: b.status ?? "Mới",
    variant: "secondary" as const,
  };

  return (
    <Link className="group block" to={ROUTES.businessDetail.buildPath(b.id)}>
      <Card
        className="flex h-full flex-col transition-shadow group-hover:shadow-xl"
        variant="elevated"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary line-clamp-2 text-base transition-colors">
              {b.businessName}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge size="sm" variant={s.variant}>
                {s.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {b.address && <p className="text-muted-foreground text-sm">{b.address}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {b.phone && <span className="text-muted-foreground text-sm">{b.phone}</span>}
            {b.reviewCount != null && (
              <span className="text-muted-foreground text-sm">{b.reviewCount} đánh giá</span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <span
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(b.mapsUrl, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                window.open(b.mapsUrl, "_blank", "noopener,noreferrer");
              }
            }}
            role="link"
            tabIndex={0}
          >
            Xem trên Maps
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
