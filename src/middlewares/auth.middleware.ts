import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../modules/users/model.user";
import {
  SubscriptionPlan,
  USER_STATUS,
  UserStatus,
} from "../modules/users/constant.user";
import {
  isTokenBlacklisted,
  getUserTokenVersion,
} from "../utils/tokenBlacklist";
import config from "../config/index";
import { IUser } from "../modules/users/interface.user";

interface DecodedToken extends JwtPayload {
  id: string;
  tokenVersion?: number;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    let token: string | null = null;

    if (header?.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: missing token" });
    }

    const decoded: any = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const inactiveStatuses: UserStatus[] = [
      USER_STATUS.BLOCK,
      USER_STATUS.SUSPEND,
    ];

    if (inactiveStatuses.includes(user.status)) {
      return res.status(403).json({ error: "Account inactive" });
    }

    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;

    if (!userWithoutPassword.subscription) {
      userObj.subscription = {
        plan: "free",
        isActive: true,
        downloadUsedThisMonth: 0,
        downloadResetAt: new Date(),
      };
    }

    if (!userObj.savedPosts) userObj.savedPosts = [];

    req.user = userObj as any;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function getMonthlyLimit(plan: SubscriptionPlan) {
  return plan === "premium" ? 150 : 2;
}

export function resetMonthlyDownloadIfNeeded(user: IUser) {
  const now = new Date();
  if (now > user.subscription.downloadResetAt) {
    user.subscription.downloadUsedThisMonth = 0;
    user.subscription.downloadResetAt = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );
  }
}
