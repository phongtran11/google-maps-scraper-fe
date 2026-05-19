import { useFetcher } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/molecules/card";
import { Badge } from "~/components/atoms/badge";
import { STATUS_MAP, NEXT_STATUS } from "~/lib/constants";

interface StatusCardProps {
  businessId: number;
  status: string;
}

export function StatusCard({ businessId, status }: StatusCardProps) {
  const fetcher = useFetcher();

  const optimisticStatus =
    fetcher.formData?.get("status")?.toString() ?? status;
  const current = STATUS_MAP[optimisticStatus] ?? {
    label: optimisticStatus,
    variant: "secondary" as const,
  };
  const next = NEXT_STATUS[optimisticStatus] ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng Thái</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge
          variant={current.variant}
          size="md"
          className="w-full justify-center"
        >
          {current.label}
        </Badge>

        {next.length > 0 && (
          <fetcher.Form
            method="patch"
            action={`/api/businesses/${businessId}/status`}
            className="flex flex-wrap gap-2"
          >
            {next.map((s) => {
              const m = STATUS_MAP[s];
              return (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  disabled={fetcher.state === "submitting"}
                  className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Chuyển sang {m.label}
                </button>
              );
            })}
          </fetcher.Form>
        )}

        {optimisticStatus === "rejected" && (
          <p className="text-xs text-muted-foreground">
            Doanh nghiệp này đã bị từ chối và không thể thay đổi trạng thái.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
