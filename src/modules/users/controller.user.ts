import { Request, Response } from "express";
import * as userService from "./service.user";
import { USER_STATUS, UserStatus } from "./constant.user";

export async function registerController(req: Request, res: Response) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "fullName, email and password required",
      });
    }

    const user = await userService.createUser(req.body);
    return res.status(201).json({ success: true, user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, pass } = req.body;

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const inactiveStatuses: UserStatus[] = [
      USER_STATUS.BLOCK,
      USER_STATUS.SUSPEND,
    ];

    if (inactiveStatuses.includes(user.status)) {
      return res.status(403).json({ error: "Account inactive" });
    }

    const match = await userService.verifyPassword(user, pass);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const tokens = userService.signTokens({
      id: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const { password, ...safeUser } = user.toObject();

    return res.json({
      user: safeUser,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch {
    return res.status(500).json({ error: "Login failed" });
  }
}

export async function changePasswordController(
  req: Request,
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Old password and new password are required",
      });
    }

    // fetch user WITH password
    const dbUser = await userService.findUserByEmail(user.email);
    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await userService.verifyPassword(dbUser, oldPassword);
    if (!match) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    await userService.changeUserPassword(user.id, newPassword);

    return res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("changePasswordController error:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
}

export async function getProfileController(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const data = await userService.findUserById(user.id);
  return res.json({ success: true, data });
}

export async function updateProfileController(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const updated = await userService.updateUser(user.id, req.body);
  return res.json({ success: true, data: updated });
}

export async function adminListUsers(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { total, items } = await userService.listUsers({}, skip, limit);
  return res.json({ total, data: items });
}

export async function adminDeleteUser(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await userService.deleteUser(id);
  return res.json({ success: true });
}
