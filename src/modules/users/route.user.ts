import express from "express";
import {
  registerController,
  loginController,
  getProfileController,
  updateProfileController,
  changePasswordController,
  adminListUsers,
  adminDeleteUser,
} from "./controller.user";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.get("/me", authMiddleware, getProfileController);
router.put("/me", authMiddleware, updateProfileController);
router.post(
  "/me/change-password",
  authMiddleware,
  changePasswordController
);

router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  adminListUsers
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  adminDeleteUser
);

export const UserRoutes = router;