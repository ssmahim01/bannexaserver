import { Request, Response } from "express";
import * as paymentMethodService from "./service.method";

export async function createPaymentMethodController(
  req: Request,
  res: Response,
) {
  try {
    const adminId = req.user._id;

    const method = await paymentMethodService.createPaymentMethod(
      req.body,
      adminId,
    );

    return res.status(201).json({
      success: true,
      data: method,
    });
  } catch (error) {
    console.error("❌ Create Payment Method Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment method",
    });
  }
}

export async function getAllPaymentMethodsController(
  req: Request,
  res: Response,
) {
  try {
    const methods = await paymentMethodService.getAllPaymentMethods();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("❌ Get Payment Methods Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
    });
  }
}

export async function getActivePaymentMethodsController(
  req: Request,
  res: Response,
) {
  try {
    const methods = await paymentMethodService.getActivePaymentMethods();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("❌ Get Active Payment Methods Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active payment methods",
    });
  }
}

export async function updatePaymentMethodController(
  req: Request,
  res: Response,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const updated = await paymentMethodService.updatePaymentMethod(
      id,
      req.body,
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("❌ Update Payment Method Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment method",
    });
  }
}

export async function togglePaymentMethodStatusController(
  req: Request,
  res: Response,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const method = await paymentMethodService.togglePaymentMethodStatus(id);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.json({
      success: true,
      data: method,
    });
  } catch (error) {
    console.error("❌ Toggle Payment Method Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle payment method",
    });
  }
}

export async function deletePaymentMethodController(
  req: Request,
  res: Response,
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const deleted = await paymentMethodService.deletePaymentMethod(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Payment Method Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment method",
    });
  }
}
