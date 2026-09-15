import { z } from "zod";
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITY,
  SUPPORT_TICKET_STATUS,
  SUPPORT_TICKET_TYPE,
} from "./constant.support";

const categoryValues = Object.values(
  SUPPORT_TICKET_CATEGORIES,
) as [
  (typeof SUPPORT_TICKET_CATEGORIES)[keyof typeof SUPPORT_TICKET_CATEGORIES],
  ...(typeof SUPPORT_TICKET_CATEGORIES)[keyof typeof SUPPORT_TICKET_CATEGORIES][],
];

const priorityValues = Object.values(
  SUPPORT_TICKET_PRIORITY,
) as [
  (typeof SUPPORT_TICKET_PRIORITY)[keyof typeof SUPPORT_TICKET_PRIORITY],
  ...(typeof SUPPORT_TICKET_PRIORITY)[keyof typeof SUPPORT_TICKET_PRIORITY][],
];

const statusValues = Object.values(
  SUPPORT_TICKET_STATUS,
) as [
  (typeof SUPPORT_TICKET_STATUS)[keyof typeof SUPPORT_TICKET_STATUS],
  ...(typeof SUPPORT_TICKET_STATUS)[keyof typeof SUPPORT_TICKET_STATUS][],
];

const typeValues = Object.values(
  SUPPORT_TICKET_TYPE,
) as [
  (typeof SUPPORT_TICKET_TYPE)[keyof typeof SUPPORT_TICKET_TYPE],
  ...(typeof SUPPORT_TICKET_TYPE)[keyof typeof SUPPORT_TICKET_TYPE][],
];

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid ID",
  );

export const createSupportTicketValidation =
  z.object({
    type: z.enum(typeValues, {
      message: "Invalid ticket type",
    }),

    subject: z
      .string()
      .trim()
      .min(
        3,
        "Subject must be at least 3 characters",
      )
      .max(
        200,
        "Subject cannot exceed 200 characters",
      ),

    description: z
      .string()
      .trim()
      .min(
        10,
        "Description must be at least 10 characters",
      )
      .max(
        5000,
        "Description cannot exceed 5000 characters",
      ),

    category: z.enum(categoryValues, {
      message: "Invalid support category",
    }),

    priority: z
      .enum(priorityValues, {
        message: "Invalid support priority",
      })
      .default("medium"),
  });

export const addSupportMessageValidation =
  z.object({
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(
        5000,
        "Message cannot exceed 5000 characters",
      ),
  });

export const submitPaymentValidation =
  z.object({
    transactionId: z
      .string()
      .trim()
      .min(
        3,
        "Transaction ID is required",
      )
      .max(
        200,
        "Transaction ID cannot exceed 200 characters",
      ),
  });

export const rejectPaymentValidation =
  z.object({
    reason: z
      .string()
      .trim()
      .min(
        3,
        "Rejection reason is required",
      )
      .max(
        1000,
        "Rejection reason cannot exceed 1000 characters",
      ),
  });

export const supportTicketIdValidation =
  z.object({
    ticketId: objectIdSchema,
  });

export const updateSupportTicketValidation =
  z
    .object({
      status: z
        .enum(statusValues, {
          message:
            "Invalid support ticket status",
        })
        .optional(),

      priority: z
        .enum(priorityValues, {
          message:
            "Invalid support ticket priority",
        })
        .optional(),

      assignedTo: objectIdSchema
        .nullable()
        .optional(),
    })
    .refine(
      (data) =>
        data.status !== undefined ||
        data.priority !== undefined ||
        data.assignedTo !== undefined,
      {
        message:
          "At least one field is required",
      },
    );

export const supportTicketQueryValidation =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),

    type: z
      .enum(typeValues, {
        message: "Invalid ticket type",
      })
      .optional(),

    status: z
      .enum(statusValues, {
        message:
          "Invalid support ticket status",
      })
      .optional(),

    category: z
      .enum(categoryValues, {
        message:
          "Invalid support category",
      })
      .optional(),

    priority: z
      .enum(priorityValues, {
        message:
          "Invalid support priority",
      })
      .optional(),

    search: z
      .string()
      .trim()
      .max(100)
      .optional(),
  });

export type CreateSupportTicketInput =
  z.infer<
    typeof createSupportTicketValidation
  >;

export type UpdateSupportTicketInput =
  z.infer<
    typeof updateSupportTicketValidation
  >;

export type SupportTicketQueryInput =
  z.infer<
    typeof supportTicketQueryValidation
  >;