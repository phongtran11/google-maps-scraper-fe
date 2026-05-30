import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { StatusCard } from "./status-card";
import type { BusinessRow } from "~/shared/types";
import { formatZaloPhone } from "~/shared/utils";

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
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
      <StatusCard businessId={b.id} status={b.status ?? "new"} />

      <LinkCard title="Bản Đồ" href={b.maps_url} label="Xem trên Google Maps" />

      {zaloPhone && (
        <LinkCard title="Zalo" href={`https://zalo.me/${zaloPhone}`} label="Gửi tin nhắn Zalo" />
      )}
    </div>
  );
}
