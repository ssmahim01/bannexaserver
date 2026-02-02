import express from "express";
import {
  getTemplateController,
  createTemplateController,
} from "./controller.template";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.get("/:slug", getTemplateController);

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  createTemplateController,
);

export const TemplateRoutes = router;
