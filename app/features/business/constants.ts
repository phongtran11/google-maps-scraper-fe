export const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "destructive" | "info" | "secondary" | "success" | "warning";
  }
> = {
  new: { label: "Mới", variant: "secondary" },
  approached: { label: "Đã tiếp cận", variant: "info" },
  contacted: { label: "Đã liên hệ", variant: "warning" },
  qualified: { label: "Tiềm năng", variant: "success" },
  rejected: { label: "Từ chối", variant: "destructive" },
};
