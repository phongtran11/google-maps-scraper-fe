export const BUSINESS_STATUS = {
  NEW: "new",
  APPROACHED: "approached",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  REJECTED: "rejected",
} as const;

export type BusinessStatus =
  (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];
