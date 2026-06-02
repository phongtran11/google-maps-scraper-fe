export const BUSINESS_STATUS = {
  APPROACHED: "approached",
  CONTACTED: "contacted",
  NEW: "new",
  QUALIFIED: "qualified",
  REJECTED: "rejected",
} as const;

export const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "destructive" | "info" | "secondary" | "success" | "warning";
  }
> = {
  approached: { label: "Đã tiếp cận", variant: "info" },
  contacted: { label: "Đã liên hệ", variant: "warning" },
  new: { label: "Mới", variant: "secondary" },
  qualified: { label: "Tiềm năng", variant: "success" },
  rejected: { label: "Từ chối", variant: "destructive" },
};

export const NEXT_STATUS: Record<string, string[]> = {
  approached: ["new", "contacted", "qualified", "rejected"],
  contacted: ["new", "approached", "qualified", "rejected"],
  new: ["approached", "contacted", "qualified"],
  qualified: ["new", "approached", "contacted", "rejected"],
  rejected: [],
};

/** Options for the status dropdown filter. First entry is the "all" sentinel. */
export const STATUS_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả trạng thái" },
  ...Object.entries(STATUS_MAP).map(([key, { label }]) => ({ key, label })),
];

export const REGIONS = {
  ba_ria: "Bà Rịa",
  chau_duc: "Châu Đức",
  dong_nai: "Đồng Nai",
  hcm: "Hồ Chí Minh",
  long_dat: "Long Đất",
  phu_my: "Phú Mỹ",
  vung_tau: "Vũng Tàu",
  xuyen_moc: "Xuyên Mộc",
} as const;

/** Options for the area/region dropdown filter. First entry is the "all" sentinel. */
export const REGION_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả khu vực" },
  ...Object.entries(REGIONS).map(([key, label]) => ({ key, label })),
];
