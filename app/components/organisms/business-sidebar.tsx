import { Card, CardContent, CardHeader, CardTitle } from "~/components/molecules/card";
import { RatingBadge } from "~/components/atoms/rating-badge";
import { Badge } from "~/components/atoms/badge";
import { ExternalLinkIcon } from "~/components/icons/external-link";
import { StatusCard } from "./status-card";
import type { BusinessRow } from "~/lib/types";
import { formatZaloPhone } from "~/lib/format";

interface BusinessSidebarProps {
  business: BusinessRow;
}

function LinkCard({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {label}
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}

export function BusinessSidebar({ business: b }: BusinessSidebarProps) {
  const zaloPhone = formatZaloPhone(b.phone);

  return (
    <div className="space-y-6">
      <StatusCard
        businessId={b.id}
        status={b.status ?? "new"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Đánh Giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <RatingBadge rating={b.rating} size="md" />
            <span className="text-2xl font-bold">
              {Number(b.rating) ? Number(b.rating).toFixed(1) : "-"}
            </span>
          </div>
          {b.review_count != null && (
            <p className="text-sm text-muted-foreground">
              {b.review_count} đánh giá
            </p>
          )}
        </CardContent>
      </Card>

      <LinkCard
        title="Bản Đồ"
        href={b.maps_url}
        label="Xem trên Google Maps"
      />

      {zaloPhone && (
        <LinkCard
          title="Zalo"
          href={`https://zalo.me/${zaloPhone}`}
          label="Gửi tin nhắn Zalo"
        />
      )}

      {b.category && (
        <Badge variant="secondary" size="md" className="w-full justify-center">
          {b.category}
        </Badge>
      )}
      {b.region && (
        <Badge variant="outline" size="md" className="w-full justify-center">
          {b.region}
        </Badge>
      )}
    </div>
  );
}
