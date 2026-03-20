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
  getSavedPostsController,
} from "./controller.post";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getPostsController);
// Register static routes before slug routes so "/me" is not treated as a slug.
router.get("/me", authMiddleware, getMyPostsController);
router.get("/saved/me", authMiddleware, getSavedPostsController);
router.get("/category/:slug", getPostsByCategoryController);
router.get("/:slug", getPostController);

router.post("/:id/like", authMiddleware, toggleLikePostController);
router.post("/:id/share", authMiddleware, sharePostController);
router.post("/:id/save", authMiddleware, toggleSavePostController);
router.put("/:id", authMiddleware, updatePostController);
router.delete("/:id", authMiddleware, deletePostController);

router.post("/", authMiddleware, createPostController);

export const PostRoutes = router;
