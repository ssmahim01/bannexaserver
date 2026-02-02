import express from "express";
import {
  getPostsController,
  getPostController,
  getPostsByCategoryController,
  createPostController,
  likePostController,
  sharePostController,
} from "./controller.post";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.get("/", getPostsController);
router.get("/:slug", getPostController);
router.get("/category/:slug", getPostsByCategoryController);

router.post("/:id/like", likePostController);
router.post("/:id/share", sharePostController);

router.post("/", authMiddleware, requireRole("admin"), createPostController);

export const PostRoutes = router;
