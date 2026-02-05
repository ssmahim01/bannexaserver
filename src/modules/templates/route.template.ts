import express from "express";
import {
  getTemplateController,
  createTemplateController,
  renderTemplateController,
  downloadTemplateController,
  getMyTemplatesController,
  updateTemplateController,
  deleteTemplateController,
} from "./controller.template";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.get("/:slug", getTemplateController);
router.get("/me", authMiddleware, getMyTemplatesController);
router.post("/:slug/render", renderTemplateController);
router.post("/:id/download", authMiddleware, downloadTemplateController);

router.put("/:id", authMiddleware, updateTemplateController);
router.delete("/:id", authMiddleware, deleteTemplateController);
router.post(
  "/",
  authMiddleware,
  createTemplateController,
);

export const TemplateRoutes = router;
