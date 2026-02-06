import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "./validation.method";

import {
  createPaymentMethodController,
  getActivePaymentMethodsController,
  getAllPaymentMethodsController,
  updatePaymentMethodController,
  deletePaymentMethodController,
} from "./controller.method";
import { validate } from "../../middlewares/validation.middleware";

const router = Router();

router.get("/", getActivePaymentMethodsController);

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  // validate(createPaymentMethodSchema),
  createPaymentMethodController,
);

router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  getAllPaymentMethodsController,
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),

  validate(updatePaymentMethodSchema),
  updatePaymentMethodController,
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),

  deletePaymentMethodController,
);

export const PaymentMethodRoutes = router;
