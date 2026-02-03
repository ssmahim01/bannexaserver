import express from "express";
import {
  getCategoriesController,
  getCategoryController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "./controller.category";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.get("/", getCategoriesController);
router.get("/:slug", getCategoryController);

router.post(
  "/",
  authMiddleware,
  requireRole("admin", "premium"),
  createCategoryController,
);
router.put(
  "/:slug",
  authMiddleware,
  requireRole("admin", "premium"),
  updateCategoryController,
);
router.delete(
  "/:slug",
  authMiddleware,
  requireRole("admin"),
  deleteCategoryController,
);

export const CategoryRoutes = router;
