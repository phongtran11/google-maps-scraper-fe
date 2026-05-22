import { Link } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { STATUS_MAP } from "~/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/shared/components/card";
import { Badge } from "~/shared/components/badge";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { ROUTES } from "~/lib/routes";

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
        className="flex flex-col h-full transition-shadow group-hover:shadow-xl"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {b.business_name}
            </CardTitle>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={s.variant} size="sm">
                {s.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {b.address && (
            <p className="text-sm text-muted-foreground">{b.address}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {b.phone && (
              <span className="text-sm text-muted-foreground">{b.phone}</span>
            )}
            {b.review_count != null && (
              <span className="text-sm text-muted-foreground">
                {b.review_count} đánh giá
              </span>
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
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            Xem trên Maps
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
