import { z } from "zod";

import { SUBSCRIPTION_PLANS } from "../users/constant.user";

const subscriptionPlanValues = [
  SUBSCRIPTION_PLANS.FREE,
  SUBSCRIPTION_PLANS.PREMIUM,
  SUBSCRIPTION_PLANS.PROFESSIONAL,
  SUBSCRIPTION_PLANS.ENTERPRISE,
] as const;

export const createOrderSchema = z.object({
  body: z.object({
    plan: z.enum(subscriptionPlanValues, {
      message: "Plan is required",
    }),

    paymentMethodId: z
      .string()
      .min(1, "Payment method is required"),

    transactionId: z
      .string()
      .min(6, "Transaction ID too short")
      .max(100, "Transaction ID too long"),

    note: z
      .string()
      .max(500, "Note too long")
      .optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),

  body: z.object({
    status: z.enum(["approved", "rejected"], {
      message: "Status must be approved or rejected",
    }),

    adminNote: z
      .string()
      .max(500, "Admin note too long")
      .optional(),
  }),
});

export const adminOrderQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(["pending", "approved", "rejected"])
      .optional(),

    userId: z.string().optional(),

    page: z.string().optional(),

    limit: z.string().optional(),
  }),
});