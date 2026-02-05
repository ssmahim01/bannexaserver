import { z } from "zod";
import { PAYMENT_METHOD_TYPES } from "./constant.method";

export const createPaymentMethodSchema = z.object({
  body: z.object({
    type: z.string().min(2, "Type is required"),
    provider: z.enum(["bkash", "nagad", "bank", "rocket"]),
    name: z.string().min(2, "Name is required"),
    accountNumber: z.string().min(3, "Account number is required"),
    instructions: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    accountNumber: z.string().min(3).optional(),
    instructions: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
