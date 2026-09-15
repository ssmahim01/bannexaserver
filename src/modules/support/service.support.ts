import mongoose, { Types } from "mongoose";
import User from "../users/model.user";
import SupportTicket from "./model.support";
import {
  SUPPORT_PAYMENT_STATUS,
  SUPPORT_TICKET_STATUS,
  SUPPORT_TICKET_TYPE,
  SupportTicketPriority,
  SupportTicketStatus,
} from "./constant.support";
import {
  CreateSupportTicketInput,
  SupportTicketQueryInput,
  UpdateSupportTicketInput,
} from "./validation.support";

import { uploadToCloudinaryBuffer } from "../../utils/cloudinary";

interface AddSupportMessageParams {
  ticketId: string;
  senderId: string;
  message: string;
  sender: "user" | "admin";
}

interface SubmitPaymentParams {
  ticketId: string;
  userId: string;
  transactionId: string;
  proof: Express.Multer.File;
}

interface RejectPaymentParams {
  ticketId: string;
  adminId: string;
  reason: string;
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `BNX-${timestamp}-${random}`;
}

export async function createSupportTicket(
  userId: string,
  data: CreateSupportTicketInput,
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const isSales = data.type === SUPPORT_TICKET_TYPE.SALES;

  const ticket = await SupportTicket.create({
    user: new Types.ObjectId(userId),

    ticketNumber: generateTicketNumber(),

    type: data.type,

    subject: data.subject.trim(),

    description: data.description.trim(),

    category: data.category,

    priority: data.priority,

    status: isSales ? SUPPORT_TICKET_STATUS.OPEN : SUPPORT_TICKET_STATUS.OPEN,

    messages: [],

    attachments: [],

    assignedTo: null,

    payment: {
      status: isSales
        ? SUPPORT_PAYMENT_STATUS.PENDING
        : SUPPORT_PAYMENT_STATUS.NOT_REQUIRED,
    },

    lastMessageAt: null,

    resolvedAt: null,

    closedAt: null,
  });

  return ticket;
}

export async function getMySupportTickets(
  userId: string,
  page = 1,
  limit = 10,
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const safePage = Math.max(1, page);

  const safeLimit = Math.min(Math.max(1, limit), 50);

  const skip = (safePage - 1) * safeLimit;

  const filter = {
    user: new Types.ObjectId(userId),
  };

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .select(
        [
          "ticketNumber",
          "type",
          "subject",
          "category",
          "priority",
          "status",
          "payment.status",
          "lastMessageAt",
          "createdAt",
          "updatedAt",
        ].join(" "),
      )
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    SupportTicket.countDocuments(filter),
  ]);

  return {
    data: tickets,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

export async function getMySupportTicket(userId: string, ticketId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  const ticket = await SupportTicket.findOne({
    _id: ticketId,
    user: userId,
  })
    .populate("assignedTo", "fullName email profileImage role")
    .lean();

  if (!ticket) {
    throw new Error("Support ticket not found");
  }

  return ticket;
}

export async function addSupportMessage({
  ticketId,
  senderId,
  message,
  sender,
}: AddSupportMessageParams) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  if (!mongoose.isValidObjectId(senderId)) {
    throw new Error("Invalid sender ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new Error("Support ticket not found");
  }

  if (ticket.status === SUPPORT_TICKET_STATUS.CLOSED) {
    throw new Error("Cannot add a message to a closed ticket");
  }

  ticket.messages.push({
    sender,
    senderId: new Types.ObjectId(senderId),
    message: message.trim(),
    attachments: [],
    createdAt: new Date(),
  });

  ticket.lastMessageAt = new Date();

  if (sender === "user" && ticket.status === SUPPORT_TICKET_STATUS.RESOLVED) {
    ticket.status = SUPPORT_TICKET_STATUS.OPEN;

    ticket.resolvedAt = null;
  }

  if (
    sender === "admin" &&
    (ticket.status === SUPPORT_TICKET_STATUS.OPEN ||
      ticket.status === SUPPORT_TICKET_STATUS.WAITING_FOR_USER)
  ) {
    ticket.status = SUPPORT_TICKET_STATUS.IN_PROGRESS;
  }

  await ticket.save();

  return ticket;
}

export async function submitEnterprisePayment({
  ticketId,
  userId,
  transactionId,
  proof,
}: SubmitPaymentParams) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!proof?.buffer?.length) {
    throw new Error("Payment proof is required");
  }

  const ticket = await SupportTicket.findOne({
    _id: ticketId,
    user: userId,
    type: SUPPORT_TICKET_TYPE.SALES,
    category: "enterprise",
  });

  if (!ticket) {
    throw new Error("Enterprise sales ticket not found");
  }

  if (
    ticket.status === SUPPORT_TICKET_STATUS.CLOSED ||
    ticket.payment.status === SUPPORT_PAYMENT_STATUS.VERIFIED
  ) {
    throw new Error("This payment request can no longer be modified");
  }

  const cloudinaryResult = await uploadToCloudinaryBuffer(
    proof.buffer,
    "bannexa-support/payments",
  );

  try {
    ticket.payment.status = SUPPORT_PAYMENT_STATUS.SUBMITTED;

    ticket.payment.transactionId = transactionId.trim();

    ticket.payment.proofUrl = cloudinaryResult.secure_url;

    ticket.payment.proofPublicId = cloudinaryResult.public_id;

    ticket.payment.proofFileName = proof.originalname;

    ticket.payment.submittedAt = new Date();

    ticket.payment.verifiedAt = null;
    ticket.payment.verifiedBy = null;
    ticket.payment.rejectionReason = null;

    ticket.status = SUPPORT_TICKET_STATUS.PAYMENT_SUBMITTED;

    ticket.lastMessageAt = new Date();

    await ticket.save();

    return ticket;
  } catch (error) {
    try {
      if (cloudinaryResult.public_id) {
        const cloudinary = await import("cloudinary");

        await cloudinary.v2.uploader.destroy(cloudinaryResult.public_id);
      }
    } catch (cleanupError) {
      console.error("Payment proof cleanup failed:", cleanupError);
    }

    throw error;
  }
}
export async function getAllSupportTickets(query: SupportTicketQueryInput) {
  const { page, limit, type, status, category, priority, search } = query;

  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (type) {
    filter.type = type;
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      {
        ticketNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        subject: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate(
        "user",
        "fullName email profileImage phone subscription.plan subscription.isActive",
      )
      .populate("assignedTo", "fullName email profileImage role")
      .select("-messages")
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    SupportTicket.countDocuments(filter),
  ]);

  return {
    data: tickets,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSupportTicketById(ticketId: string) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId)
    .populate("user", "fullName email profileImage phone subscription")
    .populate("assignedTo", "fullName email profileImage role")
    .populate("payment.verifiedBy", "fullName email role")
    .lean();

  if (!ticket) {
    throw new Error("Support ticket not found");
  }

  return ticket;
}

export async function updateSupportTicket(
  ticketId: string,
  data: UpdateSupportTicketInput,
) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  if (
    data.assignedTo !== undefined &&
    data.assignedTo !== null &&
    !mongoose.isValidObjectId(data.assignedTo)
  ) {
    throw new Error("Invalid assigned admin ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new Error("Support ticket not found");
  }

  if (data.status !== undefined) {
    ticket.status = data.status;

    if (data.status === SUPPORT_TICKET_STATUS.RESOLVED) {
      ticket.resolvedAt = new Date();

      ticket.closedAt = null;
    }

    if (data.status === SUPPORT_TICKET_STATUS.CLOSED) {
      ticket.closedAt = new Date();

      if (!ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
    }

    if (
      data.status !== SUPPORT_TICKET_STATUS.RESOLVED &&
      data.status !== SUPPORT_TICKET_STATUS.CLOSED
    ) {
      ticket.resolvedAt = null;
      ticket.closedAt = null;
    }
  }

  if (data.priority !== undefined) {
    ticket.priority = data.priority;
  }

  if (data.assignedTo !== undefined) {
    ticket.assignedTo = data.assignedTo
      ? new Types.ObjectId(data.assignedTo)
      : null;
  }

  await ticket.save();

  return getSupportTicketById(ticketId);
}

export async function rejectEnterprisePayment({
  ticketId,
  adminId,
  reason,
}: RejectPaymentParams) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw new Error("Invalid admin ID");
  }

  const ticket = await SupportTicket.findOne({
    _id: ticketId,
    type: SUPPORT_TICKET_TYPE.SALES,
    category: "enterprise",
  });

  if (!ticket) {
    throw new Error("Enterprise sales ticket not found");
  }

  if (ticket.payment.status !== SUPPORT_PAYMENT_STATUS.SUBMITTED) {
    throw new Error("Payment is not awaiting verification");
  }

  ticket.payment.status = SUPPORT_PAYMENT_STATUS.REJECTED;

  ticket.payment.rejectionReason = reason.trim();

  ticket.payment.verifiedAt = null;
  ticket.payment.verifiedBy = null;

  ticket.status = SUPPORT_TICKET_STATUS.WAITING_FOR_PAYMENT;

  ticket.lastMessageAt = new Date();

  await ticket.save();

  return ticket;
}

export async function approveEnterprisePayment(
  ticketId: string,
  adminId: string,
) {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("Invalid ticket ID");
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw new Error("Invalid admin ID");
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const ticket = await SupportTicket.findOne({
        _id: ticketId,
        type: SUPPORT_TICKET_TYPE.SALES,
        category: "enterprise",
      }).session(session);

      if (!ticket) {
        throw new Error("Enterprise sales ticket not found");
      }

      if (ticket.payment.status !== SUPPORT_PAYMENT_STATUS.SUBMITTED) {
        throw new Error("Payment is not awaiting verification");
      }

      const user = await User.findById(ticket.user).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      /*
       * Verify payment
       */
      ticket.payment.status = SUPPORT_PAYMENT_STATUS.VERIFIED;

      ticket.payment.verifiedAt = new Date();

      ticket.payment.verifiedBy = new Types.ObjectId(adminId);

      ticket.payment.rejectionReason = null;

      /*
       * Resolve sales ticket
       */
      ticket.status = SUPPORT_TICKET_STATUS.RESOLVED;

      ticket.resolvedAt = new Date();

      ticket.closedAt = null;

      ticket.lastMessageAt = new Date();

      /*
       * Activate Enterprise
       */
      user.subscription.plan = "enterprise";

      user.subscription.isActive = true;

      user.subscription.startedAt = new Date();

      /*
       * Custom Enterprise subscription
       * has no automatic expiry.
       */
      user.subscription.expiresAt = null;

      /*
       * Reset monthly usage
       */
      user.subscription.aiGenerationUsedThisMonth = 0;

      user.subscription.downloadUsedThisMonth = 0;

      const nextMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1,
      );

      user.subscription.aiGenerationResetAt = nextMonth;

      user.subscription.downloadResetAt = nextMonth;

      await user.save({
        session,
      });

      await ticket.save({
        session,
      });

      return {
        ticket,
        user,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}
