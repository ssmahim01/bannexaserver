import { PaymentMethod } from "./model.method";
import { Types } from "mongoose";

export async function createPaymentMethod(payload: any, adminId: string) {
  return PaymentMethod.create({
    ...payload,
    createdBy: new Types.ObjectId(adminId),
  });
}

export async function getAllPaymentMethods() {
  return PaymentMethod.find().sort({ createdAt: -1 });
}

export async function getActivePaymentMethods() {
  return PaymentMethod.find({ isActive: true }).sort({ createdAt: -1 });
}

export async function getPaymentMethodById(id: string) {
  return PaymentMethod.findById(id);
}

export async function updatePaymentMethod(id: string, payload: any) {
  return PaymentMethod.findByIdAndUpdate(id, payload, { new: true });
}

export async function togglePaymentMethodStatus(id: string) {
  const method = await PaymentMethod.findById(id);
  if (!method) return null;

  method.isActive = !method.isActive;
  await method.save();

  return method;
}

export async function deletePaymentMethod(id: string) {
  return PaymentMethod.findByIdAndDelete(id);
}
