import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
import { ExternalLinkIcon } from "~/shared/icons/external-link";
import { formatZaloPhone } from "~/shared/utils";

import type { BusinessRow } from "../../types";

import { StatusCard } from "./status-card";

interface BusinessSidebarProps {
  business: BusinessRow;
}

export function BusinessSidebar({ business: b }: BusinessSidebarProps) {
  const zaloPhone = formatZaloPhone(b.phone);

  return (
    <div className="space-y-6">
      <StatusCard businessId={b.id} status={b.status ?? "new"} />

      <LinkCard href={b.mapsUrl} label="Xem trên Google Maps" title="Bản Đồ" />

      {zaloPhone && (
        <LinkCard href={`https://zalo.me/${zaloPhone}`} label="Gửi tin nhắn Zalo" title="Zalo" />
      )}
    </div>
  );
}

function LinkCard({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <a
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {label}
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
