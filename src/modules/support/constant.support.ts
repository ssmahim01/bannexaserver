export const SUPPORT_TICKET_TYPE = {
  SUPPORT: "support",
  SALES: "sales",
} as const;

export type SupportTicketType =
  (typeof SUPPORT_TICKET_TYPE)[keyof typeof SUPPORT_TICKET_TYPE];

export const SUPPORT_TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in-progress",
  WAITING_FOR_USER: "waiting-for-user",
  WAITING_FOR_PAYMENT: "waiting-for-payment",
  PAYMENT_SUBMITTED: "payment-submitted",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type SupportTicketStatus =
  (typeof SUPPORT_TICKET_STATUS)[keyof typeof SUPPORT_TICKET_STATUS];

export const SUPPORT_TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type SupportTicketPriority =
  (typeof SUPPORT_TICKET_PRIORITY)[keyof typeof SUPPORT_TICKET_PRIORITY];

export const SUPPORT_TICKET_CATEGORIES = {
  ACCOUNT: "account",
  BILLING: "billing",
  SUBSCRIPTION: "subscription",
  ENTERPRISE: "enterprise",
  AI_GENERATION: "ai-generation",
  DOWNLOAD: "download",
  TEMPLATE: "template",
  PAYMENT: "payment",
  TECHNICAL: "technical",
  BUG_REPORT: "bug-report",
  FEATURE_REQUEST: "feature-request",
  OTHER: "other",
} as const;

export type SupportTicketCategory =
  (typeof SUPPORT_TICKET_CATEGORIES)[keyof typeof SUPPORT_TICKET_CATEGORIES];

export const SUPPORT_MESSAGE_SENDER = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type SupportMessageSender =
  (typeof SUPPORT_MESSAGE_SENDER)[keyof typeof SUPPORT_MESSAGE_SENDER];

export const SUPPORT_PAYMENT_STATUS = {
  NOT_REQUIRED: "not-required",
  PENDING: "pending",
  SUBMITTED: "submitted",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type SupportPaymentStatus =
  (typeof SUPPORT_PAYMENT_STATUS)[keyof typeof SUPPORT_PAYMENT_STATUS];