import { Types } from "mongoose";
import { OrderPlan, OrderStatus, PaymentChannel } from "./constant.order";

export interface IOrder {
  user: Types.ObjectId;

  plan: OrderPlan;
  amount: number; 
  currency: string;

  // Payment
  paymentMethod: Types.ObjectId; 
  paymentChannel: PaymentChannel;

  transactionId: string;
  paymentScreenshot?: string; 
  note?: string;
  adminNote?: string;

  // Status
  status: OrderStatus;
  reviewedBy?: Types.ObjectId; 
  reviewedAt?: Date;
  rejectionReason?: string;

  // Meta
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}