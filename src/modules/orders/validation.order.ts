import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    plan: z.enum(["premium"]),
    paymentMethodId: z.string().min(1, "Payment method is required"),
    transactionId: z
      .string()
      .min(6, "Transaction ID too short")
      .max(100),
    note: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"]),
    adminNote: z.string().max(500).optional(),
  }),
});

export const adminOrderQuerySchema = z.object({
  query: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    userId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
