import { Request, Response } from "express";
import * as OrderService from "./service.order";

export async function createOrderController(req: Request, res: Response) {
  const userId = req.user._id;

  const order = await OrderService.createOrder({
    userId,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Order submitted successfully",
    data: order,
  });
}

export async function getMyOrdersController(req: Request, res: Response) {
  const userId = req.user._id;

  const orders = await OrderService.getOrdersByUser(userId);

  res.json({
    success: true,
    data: orders,
  });
}

export async function getAllOrdersController(req: Request, res: Response) {
  const orders = await OrderService.getAllOrders();

  res.json({
    success: true,
    data: orders,
  });
}

export async function updateOrderStatusController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const { status, adminNote } = req.body;

  const updated = await OrderService.updateOrderStatus(id, status, adminNote);

  res.json({
    success: true,
    message: `Order ${status}`,
    data: updated,
  });
}

export async function deleteOrderController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await OrderService.deleteOrder(id);

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
}
