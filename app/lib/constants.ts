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
  rejected: ["new", "approached", "contacted", "qualified"],
};

/** Options for the status dropdown filter. First entry is the "all" sentinel. */
export const STATUS_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả trạng thái" },
  ...Object.entries(STATUS_MAP).map(([key, { label }]) => ({ key, label })),
];

export const REGIONS = {
  ba_ria: "Bà Rịa",
  nghia_thanh: "Nghĩa Thành",
  dong_nai: "Đồng Nai",
  vung_tau: "Vũng Tàu",
  hcm: "Hồ Chí Minh",
  long_dien: "Long Điền",
  phu_my: "Phú Mỹ",
  xuyen_moc: "Xuyên Mộc",
  ngai_giao: "Ngãi Giao",
  dat_do: "Đất Đỏ",
} as const;

/** Options for the area/region dropdown filter. First entry is the "all" sentinel. */
export const REGION_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả khu vực" },
  ...Object.entries(REGIONS).map(([key, label]) => ({ key, label })),
];

