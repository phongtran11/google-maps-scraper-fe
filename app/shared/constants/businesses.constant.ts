export const BUSINESS_STATUS = {
  NEW: "new",
  APPROACHED: "approached",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  REJECTED: "rejected",
} as const;

export const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "secondary" | "info" | "warning" | "success" | "destructive";
  }
> = {
  new: { label: "Mới", variant: "secondary" },
  approached: { label: "Đã tiếp cận", variant: "info" },
  contacted: { label: "Đã liên hệ", variant: "warning" },
  qualified: { label: "Tiềm năng", variant: "success" },
  rejected: { label: "Từ chối", variant: "destructive" },
};

export const NEXT_STATUS: Record<string, string[]> = {
  new: ["approached", "contacted", "qualified"],
  approached: ["new", "contacted", "qualified", "rejected"],
  contacted: ["new", "approached", "qualified", "rejected"],
  qualified: ["new", "approached", "contacted", "rejected"],
  rejected: [],
};

/** Options for the status dropdown filter. First entry is the "all" sentinel. */
export const STATUS_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả trạng thái" },
  ...Object.entries(STATUS_MAP).map(([key, { label }]) => ({ key, label })),
];
