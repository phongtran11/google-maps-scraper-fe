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
