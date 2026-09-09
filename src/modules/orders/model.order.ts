import { Schema, model } from "mongoose";
import { IOrder } from "./interface.order";
import { OrderPlan, OrderStatus } from "./constant.order";

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: Object.values(OrderPlan),
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    paymentMethod: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    paymentScreenshot: {
      type: String,
    },

    note: {
      type: String,
      trim: true,
    },

    adminNote: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Order = model<IOrder>("Order", orderSchema);
