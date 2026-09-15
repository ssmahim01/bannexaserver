import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { uploadSupportImage } from "../../middlewares/uploadSupport";

import {
  addAdminSupportMessageController,
  addUserSupportMessageController,
  approveEnterprisePaymentController,
  createSupportTicketController,
  getAllSupportTicketsController,
  getMySupportTicketController,
  getMySupportTicketsController,
  getSupportTicketByIdController,
  rejectEnterprisePaymentController,
  submitEnterprisePaymentController,
  updateSupportTicketController,
} from "./controller.support";

const router = Router();

router.get(
  "/admin/all",
  authMiddleware,
  requireRole("admin"),
  getAllSupportTicketsController,
);

router.get(
  "/admin/:ticketId",
  authMiddleware,
  requireRole("admin"),
  getSupportTicketByIdController,
);

router.patch(
  "/admin/:ticketId",
  authMiddleware,
  requireRole("admin"),
  updateSupportTicketController,
);

router.post(
  "/admin/:ticketId/messages",
  authMiddleware,
  requireRole("admin"),
  addAdminSupportMessageController,
);

router.post(
  "/admin/:ticketId/payment/approve",
  authMiddleware,
  requireRole("admin"),
  approveEnterprisePaymentController,
);

router.post(
  "/admin/:ticketId/payment/reject",
  authMiddleware,
  requireRole("admin"),
  rejectEnterprisePaymentController,
);

router.post("/", authMiddleware, createSupportTicketController);

router.get("/", authMiddleware, getMySupportTicketsController);

router.get("/:ticketId", authMiddleware, getMySupportTicketController);

router.post(
  "/:ticketId/messages",
  authMiddleware,
  addUserSupportMessageController,
);

router.post(
  "/:ticketId/payment",
  authMiddleware,
  uploadSupportImage.single("proof"),
  submitEnterprisePaymentController,
);

export const SupportRoutes = router;
