export const STATUS_MAP: Record<
  string,
  { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }
> = {
  new: { label: "Mới", variant: "secondary" },
  approached: { label: "Đã tiếp cận", variant: "info" },
  contacted: { label: "Đã liên hệ", variant: "warning" },
  qualified: { label: "Tiềm năng", variant: "success" },
  rejected: { label: "Từ chối", variant: "destructive" },
};

export const NEXT_STATUS: Record<string, string[]> = {
  new: ["approached", "rejected"],
  approached: ["contacted", "rejected"],
  contacted: ["qualified", "rejected"],
  qualified: ["rejected"],
  rejected: [],
};

export const AREAS = ["Ngãi Giao", "Suối Nghệ", "Nghĩa Thành", "Bình Giã"] as const;

/** Options for the status dropdown filter. First entry is the "all" sentinel. */
export const STATUS_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả trạng thái" },
  ...Object.entries(STATUS_MAP).map(([key, { label }]) => ({ key, label })),
];

/** Options for the area dropdown filter. First entry is the "all" sentinel. */
export const AREA_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả khu vực" },
  ...AREAS.map((a) => ({ key: a, label: a })),
];

