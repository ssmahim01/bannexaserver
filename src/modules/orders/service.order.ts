import { Order } from "./model.order";
import { PaymentMethod } from "../payment-method/model.method";
import { Types } from "mongoose";
import User from "../users/model.user";
import { OrderStatus } from "./constant.order";

export async function createOrder(payload: {
  userId: string;
  plan: "premium";
  amount: number;
  paymentMethodId: string;
  transactionId: string;
  screenshot?: string;
  note?: string;
}) {
  const paymentMethod = await PaymentMethod.findById(payload.paymentMethodId);

  if (!paymentMethod || !paymentMethod.isActive) {
    throw new Error("Invalid or inactive payment method");
  }

  return Order.create({
    user: new Types.ObjectId(payload.userId),
    plan: payload.plan,
    amount: payload.amount,
    paymentMethod: paymentMethod._id,
    transactionId: payload.transactionId,
    screenshot: payload.screenshot,
    note: payload.note,
    status: "pending",
  });
}

export async function getOrdersByUser(userId: string) {
  return Order.find({ user: new Types.ObjectId(userId) })
    .populate("paymentMethod", "type provider account")
    .sort({ createdAt: -1 });
}

export async function getAllOrders() {
  return Order.find()
    .populate("user", "fullName email")
    .populate("paymentMethod", "type provider")
    .sort({ createdAt: -1 });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNote?: string,
) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (status) {
    order.status = status;
  }

  if (adminNote) {
    order.adminNote = adminNote;
  }

  await order.save();

  if (status === "approved") {
    await User.findByIdAndUpdate(order.user, {
      $set: {
        "subscription.plan": "premium",
        "subscription.isActive": true,
        "subscription.startedAt": new Date(),
        "subscription.expiresAt": new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  return order;
}

export async function deleteOrder(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  await order.deleteOne();
  return { success: true };
}
