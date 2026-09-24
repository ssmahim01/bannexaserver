import { Router } from "express";

import {
  generateTemplateImageController,
  getTemplateGenerationHistoryController,
  getTemplateGenerationController,
  deleteTemplateGenerationController,
} from "./controller.template-generator";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/generate", authMiddleware, generateTemplateImageController);

router.get("/history", authMiddleware, getTemplateGenerationHistoryController);

router.get("/history/:id", authMiddleware, getTemplateGenerationController);

router.delete(
  "/history/:id",
  authMiddleware,
  deleteTemplateGenerationController,
);

export const TemplateGeneratorRoutes = router;
