import { ExternalLink } from "lucide-react";

import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
import { cn, formatZaloPhone } from "~/shared/utils";

import { StatusCard } from "./status-card";

type BusinessSidebarProps = {
  id: number;
  mapsUrl: null | string;
  phone: null | string;
  status: null | string;
};

export function BusinessSidebar({ id, mapsUrl, phone, status }: BusinessSidebarProps) {
  const zaloPhone = formatZaloPhone(phone);

  return (
    <div className="space-y-6">
      <StatusCard businessId={id} status={status ?? "new"} />

      {mapsUrl ? <LinkCard href={mapsUrl} label="Xem trên Google Maps" title="Bản Đồ" /> : null}

      {zaloPhone ? (
        <LinkCard href={`https://zalo.me/${zaloPhone}`} label="Gửi tin nhắn Zalo" title="Zalo" />
      ) : null}
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
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between")}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {label}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
