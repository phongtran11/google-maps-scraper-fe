export const REGIONS = {
  ba_ria: "Bà Rịa",
  chau_duc: "Châu Đức",
  dong_nai: "Đồng Nai",
  vung_tau: "Vũng Tàu",
  hcm: "Hồ Chí Minh",
  long_dat: "Long Đất",
  phu_my: "Phú Mỹ",
  xuyen_moc: "Xuyên Mộc",
} as const;

/** Options for the area/region dropdown filter. First entry is the "all" sentinel. */
export const REGION_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: "", label: "Tất cả khu vực" },
  ...Object.entries(REGIONS).map(([key, label]) => ({ key, label })),
];
