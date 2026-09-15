import { Types } from "mongoose";
import {
  SupportMessageSender,
  SupportPaymentStatus,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketType,
} from "./constant.support";

export interface ISupportAttachment {
  url: string;
  publicId?: string;
  fileName?: string;
}

export interface ISupportPayment {
  status: SupportPaymentStatus;

  transactionId?: string | null;

  proofUrl?: string | null;
  proofPublicId?: string | null;
  proofFileName?: string | null;

  submittedAt?: Date | null;

  verifiedAt?: Date | null;

  verifiedBy?: Types.ObjectId | null;

  rejectionReason?: string | null;
}

export interface ISupportMessage {
  _id?: Types.ObjectId;

  sender: SupportMessageSender;
  senderId: Types.ObjectId;

  message: string;

  attachments: ISupportAttachment[];

  createdAt: Date;
  updatedAt?: Date;
}

export interface ISupportTicket {
  _id: Types.ObjectId;

  user: Types.ObjectId;

  ticketNumber: string;

  type: SupportTicketType;

  subject: string;
  description: string;

  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;

  messages: ISupportMessage[];

  attachments: ISupportAttachment[];

  assignedTo?: Types.ObjectId | null;

  payment: ISupportPayment;

  lastMessageAt?: Date | null;

  resolvedAt?: Date | null;
  closedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}