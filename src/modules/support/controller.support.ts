import { Request, Response } from "express";
import {
  addSupportMessageValidation,
  createSupportTicketValidation,
  rejectPaymentValidation,
  submitPaymentValidation,
  supportTicketIdValidation,
  supportTicketQueryValidation,
  updateSupportTicketValidation,
} from "./validation.support";

import {
  addSupportMessage,
  approveEnterprisePayment,
  createSupportTicket,
  getAllSupportTickets,
  getMySupportTicket,
  getMySupportTickets,
  getSupportTicketById,
  rejectEnterprisePayment,
  submitEnterprisePayment,
  updateSupportTicket,
} from "./service.support";

export async function createSupportTicketController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validation = createSupportTicketValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid request",
      });
    }

    /*
     * Security:
     * Enterprise sales must use the
     * Enterprise category.
     */
    if (
      validation.data.type === "sales" &&
      validation.data.category !== "enterprise"
    ) {
      return res.status(400).json({
        success: false,
        message: "Sales tickets must use the Enterprise category",
      });
    }

    const ticket = await createSupportTicket(
      req.user._id.toString(),
      validation.data,
    );

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
}

export async function getMySupportTicketsController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validation = supportTicketQueryValidation.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid query parameters",
      });
    }

    const result = await getMySupportTickets(
      req.user._id.toString(),
      validation.data.page,
      validation.data.limit,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get my support tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch support tickets",
    });
  }
}

export async function getMySupportTicketController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validation = supportTicketIdValidation.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await getMySupportTicket(
      req.user._id.toString(),
      validation.data.ticketId,
    );

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Get my support ticket error:", error);

    if (
      error instanceof Error &&
      error.message === "Support ticket not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch support ticket",
    });
  }
}

export async function addUserSupportMessageController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const idValidation = supportTicketIdValidation.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const bodyValidation = addSupportMessageValidation.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        message: bodyValidation.error.issues[0]?.message || "Invalid message",
      });
    }

    /*
     * Ownership check.
     */
    await getMySupportTicket(
      req.user._id.toString(),
      idValidation.data.ticketId,
    );

    const ticket = await addSupportMessage({
      ticketId: idValidation.data.ticketId,
      senderId: req.user._id.toString(),
      message: bodyValidation.data.message,
      sender: "user",
    });

    return res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Add user support message error:", error);

    if (
      error instanceof Error &&
      error.message === "Support ticket not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (error instanceof Error && error.message.includes("closed ticket")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add message",
    });
  }
}

export async function submitEnterprisePaymentController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const idValidation = supportTicketIdValidation.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const validation = submitPaymentValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid payment information",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment proof screenshot is required",
      });
    }

    const ticket = await submitEnterprisePayment({
      ticketId: idValidation.data.ticketId,

      userId: req.user._id.toString(),

      transactionId: validation.data.transactionId,

      proof: req.file,
    });

    return res.status(200).json({
      success: true,
      message:
        "Payment proof submitted successfully. Our team will verify it shortly.",
      data: ticket,
    });
  } catch (error) {
    console.error("Submit enterprise payment error:", error);

    if (
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("no longer"))
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit payment proof",
    });
  }
}

export async function getAllSupportTicketsController(
  req: Request,
  res: Response,
) {
  try {
    const validation = supportTicketQueryValidation.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid query parameters",
      });
    }

    const result = await getAllSupportTickets(validation.data);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get all support tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch support tickets",
    });
  }
}

export async function getSupportTicketByIdController(
  req: Request,
  res: Response,
) {
  try {
    const validation = supportTicketIdValidation.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await getSupportTicketById(validation.data.ticketId);

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Get support ticket error:", error);

    if (
      error instanceof Error &&
      error.message === "Support ticket not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch support ticket",
    });
  }
}

export async function updateSupportTicketController(
  req: Request,
  res: Response,
) {
  try {
    const idValidation = supportTicketIdValidation.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const validation = updateSupportTicketValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid update data",
      });
    }

    const ticket = await updateSupportTicket(
      idValidation.data.ticketId,
      validation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update support ticket error:", error);

    if (
      error instanceof Error &&
      error.message === "Support ticket not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update support ticket",
    });
  }
}

export async function addAdminSupportMessageController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const idValidation = supportTicketIdValidation.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const validation = addSupportMessageValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid message",
      });
    }

    const ticket = await addSupportMessage({
      ticketId: idValidation.data.ticketId,
      senderId: req.user._id.toString(),
      message: validation.data.message,
      sender: "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Admin reply added successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Add admin support message error:", error);

    if (error instanceof Error && error.message.includes("closed ticket")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add admin reply",
    });
  }
}

export async function rejectEnterprisePaymentController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const idValidation = supportTicketIdValidation.safeParse(req.params);

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const validation = rejectPaymentValidation.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid rejection reason",
      });
    }

    const ticket = await rejectEnterprisePayment({
      ticketId: idValidation.data.ticketId,

      adminId: req.user._id.toString(),

      reason: validation.data.reason,
    });

    return res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Reject enterprise payment error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reject payment",
    });
  }
}

export async function approveEnterprisePaymentController(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validation = supportTicketIdValidation.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const result = await approveEnterprisePayment(
      validation.data.ticketId,
      req.user._id.toString(),
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and Enterprise plan activated successfully.",
      data: {
        ticket: result.ticket,
        user: {
          id: result.user._id,
          plan: result.user.subscription.plan,
          isActive: result.user.subscription.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Approve enterprise payment error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to approve payment",
    });
  }
}
