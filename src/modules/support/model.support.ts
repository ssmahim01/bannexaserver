import mongoose, { Model, Schema } from "mongoose";
import { ISupportTicket } from "./interface.support";
import {
  SUPPORT_MESSAGE_SENDER,
  SUPPORT_PAYMENT_STATUS,
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITY,
  SUPPORT_TICKET_STATUS,
  SUPPORT_TICKET_TYPE,
} from "./constant.support";

const supportAttachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    fileName: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const supportMessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: Object.values(SUPPORT_MESSAGE_SENDER),
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    attachments: {
      type: [supportAttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const supportPaymentSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(SUPPORT_PAYMENT_STATUS),
      default: SUPPORT_PAYMENT_STATUS.NOT_REQUIRED,
      required: true,
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    proofUrl: {
      type: String,
      trim: true,
      default: null,
    },

    proofPublicId: {
      type: String,
      trim: true,
      default: null,
    },

    proofFileName: {
      type: String,
      trim: true,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(SUPPORT_TICKET_TYPE),
      required: true,
      default: SUPPORT_TICKET_TYPE.SUPPORT,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      enum: Object.values(SUPPORT_TICKET_CATEGORIES),
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: Object.values(SUPPORT_TICKET_PRIORITY),
      default: SUPPORT_TICKET_PRIORITY.MEDIUM,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(SUPPORT_TICKET_STATUS),
      default: SUPPORT_TICKET_STATUS.OPEN,
      required: true,
      index: true,
    },

    messages: {
      type: [supportMessageSchema],
      default: [],
    },

    attachments: {
      type: [supportAttachmentSchema],
      default: [],
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    payment: {
      type: supportPaymentSchema,
      default: () => ({
        status: SUPPORT_PAYMENT_STATUS.NOT_REQUIRED,
      }),
    },

    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

supportTicketSchema.index({
  user: 1,
  createdAt: -1,
});

supportTicketSchema.index({
  type: 1,
  status: 1,
  priority: 1,
  createdAt: -1,
});

supportTicketSchema.index({
  assignedTo: 1,
  status: 1,
});

supportTicketSchema.index({
  category: 1,
  createdAt: -1,
});

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>(
    "SupportTicket",
    supportTicketSchema,
  );

export default SupportTicket;