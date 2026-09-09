export enum OrderStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export enum OrderPlan {
  PREMIUM = "premium",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

export enum PaymentChannel {
  BKASH = "bkash",
  NAGAD = "nagad",
  ROCKET = "rocket",
  BANK = "bank",
}

export const ORDER_STATUS_FLOW = {
  pending: ["approved", "rejected"],
  approved: [],
  rejected: [],
};