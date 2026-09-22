import { Router } from "express";

import {
  getGeneratorCategoriesController,
  getGeneratorEventsController,
  getGeneratorTemplatesController,
  getGeneratorTemplateController,
  generateTemplateImageController,
} from "./controller.template-generator";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/categories", getGeneratorCategoriesController);

router.get("/categories/:categoryId/events", getGeneratorEventsController);

router.get("/events/:eventId/templates", getGeneratorTemplatesController);

router.get("/templates/:templateId", getGeneratorTemplateController);

router.post("/generate", authMiddleware, generateTemplateImageController);

export const TemplateGeneratorRoutes = router;
