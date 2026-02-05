import { Types } from "mongoose";
import { PaymentMethodType, PaymentMethodStatus } from "./constant.method";

export interface IPaymentMethod {
  _id?: Types.ObjectId;
  type: PaymentMethodType;
  name: string; 
  accountNumber: string;

  accountName?: string;

  bankName?: string;
  branchName?: string;
  routingNumber?: string;

  instructions?: string;

  logo?: string;

  status: PaymentMethodStatus;

  isActive: boolean;

  createdBy: Types.ObjectId; 

  createdAt?: Date;
  updatedAt?: Date;
}