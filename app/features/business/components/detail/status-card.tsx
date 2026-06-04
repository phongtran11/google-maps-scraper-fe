import { useFetcher } from "react-router";

import { Card, CardContent, CardHeader, CardTitle, Select } from "~/shared/components";
import { ROUTES } from "~/shared/constants";

import { NEXT_STATUS, STATUS_MAP } from "../../constants";

interface StatusCardProps {
  businessId: number;
  status: string;
}

export function StatusCard({ businessId, status }: StatusCardProps) {
  const fetcher = useFetcher();

  const optimisticStatus = fetcher.formData?.get("status")?.toString() ?? status;

  const next = NEXT_STATUS[optimisticStatus] ?? [];
  const hasNoTransitions = next.length === 0;

  const options = Object.entries(STATUS_MAP).map(([key, value]) => {
    const isCurrent = key === optimisticStatus;
    const isNext = next.includes(key);

    const dotColorClass =
      {
        new: "bg-muted-foreground/80",
        approached: "bg-info",
        contacted: "bg-warning",
        qualified: "bg-success",
        rejected: "bg-destructive",
      }[key] || "bg-muted-foreground";

    return {
      disabled: !isCurrent && !isNext,
      key,
      label: (
        <span className="flex items-center gap-2 font-medium">
          <span className={`h-2 w-2 rounded-full ${dotColorClass}`} />
          <span>{value.label}</span>
        </span>
      ),
    };
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== optimisticStatus) {
      fetcher.submit(
        { status: newStatus },
        {
          action: ROUTES.api.businessStatus.buildPath(businessId),
          method: "patch",
        },
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng Thái</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          aria-label="Chọn trạng thái doanh nghiệp"
          className="w-full"
          disabled={fetcher.state === "submitting" || hasNoTransitions}
          onChange={handleStatusChange}
          options={options}
          value={optimisticStatus}
        />

        {optimisticStatus === "rejected" && (
          <p className="text-muted-foreground text-xs">
            Doanh nghiệp này đã bị từ chối và không thể thay đổi trạng thái.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
