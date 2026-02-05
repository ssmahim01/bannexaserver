export const PAYMENT_METHOD_TYPES = {
  BKASH: "bkash",
  NAGAD: "nagad",
  ROCKET: "rocket",
  BANK: "bank",
} as const;

export type PaymentMethodType =
  (typeof PAYMENT_METHOD_TYPES)[keyof typeof PAYMENT_METHOD_TYPES];

export const PAYMENT_METHOD_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type PaymentMethodStatus =
  (typeof PAYMENT_METHOD_STATUS)[keyof typeof PAYMENT_METHOD_STATUS];