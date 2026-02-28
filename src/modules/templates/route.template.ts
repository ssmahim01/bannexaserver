import express from "express";
import {
  getTemplateController,
  createTemplateController,
  renderTemplateController,
  downloadTemplateController,
  getMyTemplatesController,
  updateTemplateController,
  deleteTemplateController,
  getPublicTemplates,
  getAllTemplatesAdmin,
  getTemplatePostsController,
} from "./controller.template";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:slug", getTemplateController);
router.get("/me", authMiddleware, getMyTemplatesController);
router.get("/", getPublicTemplates);
router.get(
  "/admin/templates",
  authMiddleware,
  requireRole("admin"),
  getAllTemplatesAdmin,
);
router.post("/:slug/render", renderTemplateController);
router.post(
  "/:slug/download",
  authMiddleware,
  upload.single("image"),
  downloadTemplateController,
);

router.get("/:slug/posts", getTemplatePostsController);

router.put("/:id", authMiddleware, updateTemplateController);
router.delete("/:id", authMiddleware, deleteTemplateController);
router.post("/", authMiddleware, createTemplateController);

export const TemplateRoutes = router;
