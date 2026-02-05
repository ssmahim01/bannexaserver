import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as OrderController from "./controller.order";
import { createOrderSchema, updateOrderStatusSchema } from "./validation.order";
import { validate } from "../../middlewares/validation.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createOrderSchema),
  OrderController.createOrderController,
);

// Get my orders
router.get("/my", authMiddleware, OrderController.getMyOrdersController);

// Get all orders
router.get(
  "/admin",
  authMiddleware,
  requireRole("admin"),
  OrderController.getAllOrdersController,
);

// Approve / Reject order
router.patch(
  "/admin/:id/status",
  authMiddleware,
  requireRole("admin"),

  validate(updateOrderStatusSchema),
  OrderController.updateOrderStatusController,
);

// Delete order
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("admin"),
  OrderController.deleteOrderController,
);

export const OrderRoutes = router;
