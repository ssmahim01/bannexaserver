export const CATEGORY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type CategoryStatus =
  (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];