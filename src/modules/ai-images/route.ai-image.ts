import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";

import { deleteMyAIImageController, generateAIImageController, getAIUsageController, getMyAIGenerationsController, getMyAIImageController } from "./controller.ai-image";
import { uploadImage } from "../../middlewares/uploadImage";

const router = Router();

router.get(
  "/usage",
  authMiddleware,
  getAIUsageController,
);

router.get(
  "/usage",
  authMiddleware,
  getAIUsageController,
);

router.get(
  "/my-generations",
  authMiddleware,
  getMyAIGenerationsController,
);

router.get(
  "/my-generations/:imageId",
  authMiddleware,
  getMyAIImageController,
);

router.delete(
  "/my-generations/:imageId",
  authMiddleware,
  deleteMyAIImageController,
);

router.post(
  "/generate",
  authMiddleware,
  uploadImage.single("image"),
  generateAIImageController,
);

router.post(
  "/generate",
  authMiddleware,
  uploadImage.single("image"),
  generateAIImageController,
);

export const AIRoutes = router;
