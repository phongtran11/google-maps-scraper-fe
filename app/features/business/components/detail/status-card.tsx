import { useFetcher } from "react-router";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/components";
import { ROUTES } from "~/shared/constants";

import { STATUS_MAP } from "../../constants";

type StatusCardProps = {
  businessId: number;
  status: string;
};

export function StatusCard({ businessId, status }: StatusCardProps) {
  const fetcher = useFetcher();

  const optimisticStatus = fetcher.formData?.get("status")?.toString() ?? status;

  const options = Object.entries(STATUS_MAP).map(([key, value]) => {
    const dotColorClass =
      {
        new: "bg-muted-foreground/80",
        approached: "bg-info",
        contacted: "bg-warning",
        qualified: "bg-success",
        rejected: "bg-destructive",
      }[key] || "bg-muted-foreground";

    return {
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
          disabled={fetcher.state === "submitting"}
          onValueChange={handleStatusChange}
          value={optimisticStatus}
        >
          <SelectTrigger aria-label="Chọn trạng thái doanh nghiệp" className="w-full">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
