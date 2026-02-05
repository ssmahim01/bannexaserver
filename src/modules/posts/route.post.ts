import express from "express";
import {
  getPostsController,
  getPostController,
  getPostsByCategoryController,
  createPostController,
  sharePostController,
  toggleSavePostController,
  toggleLikePostController,
  getMyPostsController,
  updatePostController,
  deletePostController,
} from "./controller.post";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.get("/", getPostsController);
router.get("/:slug", getPostController);
router.get("/me", authMiddleware, getMyPostsController);
router.get("/category/:slug", getPostsByCategoryController);

router.post("/:id/like", authMiddleware, toggleLikePostController);
router.post("/:id/share", authMiddleware, sharePostController);
router.post("/:id/save", authMiddleware, toggleSavePostController);
router.put("/:id", authMiddleware, updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

router.post(
  "/",
  authMiddleware,
  requireRole("admin", "premium"),
  createPostController,
);

export const PostRoutes = router;