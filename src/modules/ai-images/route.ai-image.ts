import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";

import { generateAIImageController, getAIUsageController } from "./controller.ai-image";
import { uploadImage } from "../../middlewares/uploadImage";

const router = Router();

router.get(
  "/usage",
  authMiddleware,
  getAIUsageController,
);

router.post(
  "/generate",
  authMiddleware,
  uploadImage.single("image"),
  generateAIImageController,
);

export const AIRoutes = router;
