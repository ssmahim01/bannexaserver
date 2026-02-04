import { Request, Response } from "express";
import * as userService from "./service.user";
import { USER_STATUS, UserStatus } from "./constant.user";
import { signAccessToken, signRefreshToken } from "../../utils/tokens";
import { setRefreshCookie } from "../../utils/cookies";

export async function registerController(req: Request, res: Response) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        error: "fullName, email, role and password required",
      });
    }

    const user = await userService.createUser(req.body);
    return res.status(201).json({ success: true, user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function loginController(req: Request, res: Response) {
  const { email, pass } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user || !user.password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (["block", "suspend"].includes(user.status)) {
    return res.status(403).json({ error: "Account inactive" });
  }

  const match = await userService.verifyPassword(user, pass);
  if (!match) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = userService.signTokens({
    id: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const { ...safeUser } = user.toObject();

  return res.json({
    user: {
      id: safeUser._id,
      fullName: safeUser.fullName,
      email: safeUser.email,
      role: safeUser.role,
      status: safeUser.status,
      profileImage: safeUser.profileImage,
      providerId: safeUser.providerId,
    },
    token: accessToken,
    refreshToken,
  });
}

export async function oauthGoogleController(req: Request, res: Response) {
  try {
    const { fullName, email, profileImage, providerId } = req.body;
    const referralCode = req.query.ref as string | undefined;

    if (!email || !providerId) {
      return res.status(400).json({ error: "Invalid OAuth payload" });
    }
    let user = await userService.findUserByEmail(email);

    if (!user) {
      user = (await userService.createUser({
        fullName: fullName || "",
        email,
        profileImage: profileImage || "",
        provider: "google",
        providerId,
        role: "customer",
        referralCode,
        status: USER_STATUS.ACTIVE,
        isOtpVerified: true,
      })) as any;
      // if (user?.email && user?.fullName) {
      //   sendWelcomeEmail(user?.email, user?.fullName);
      // }
    } else {
      const updatePayload: any = {};

      if (!user.providerId) {
        updatePayload.provider = "google";
        updatePayload.providerId = providerId;
      }
      if (profileImage && user.profileImage !== profileImage) {
        updatePayload.profileImage = profileImage;
      }
      if (Object.keys(updatePayload).length > 0) {
        user = (await userService.updateUser(
          user.id,
          updatePayload,
        )) as typeof user;
      }
    }

    if (!user) {
      return res.status(500).json({ error: "Failed to process user data" });
    }
    const token = await signAccessToken(user.id, user.role);
    const refreshToken = await signRefreshToken(user.id, user.role);

    // Set cookie for direct browser requests (credentials login)
    setRefreshCookie(res, refreshToken, 7 * 24 * 3600);

    const { password: _, ...userOut } = user as any;
    return res.json({ user: userOut, token, refreshToken });
  } catch (err) {
    console.warn("oauthGoogleController Error:", err);
    return res.status(500).json({ error: "OAuth failed" });
  }
}

export async function changePasswordController(req: Request, res: Response) {
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

  const data = await userService.findUserById(user._id);
  return res.json({ success: true, data });
}

export async function updateProfileController(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const updated = await userService.updateUser(user._id, req.body);
  return res.json({ success: true, data: updated });
}

export async function adminUpdateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const user = await userService.updateUser(id as string, payload);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("adminUpdateUser", err);
    return res.status(500).json({ error: "Update failed" });
  }
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
