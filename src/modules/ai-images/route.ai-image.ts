import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";

import { generateAIImageController } from "./controller.ai-image";
import { uploadImage } from "../../middlewares/uploadImage";

const router = Router();

router.post(
  "/generate",
  authMiddleware,
  uploadImage.single("image"),
  generateAIImageController,
);

export const AIRoutes = router;
