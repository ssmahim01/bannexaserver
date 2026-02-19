import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../modules/users/model.user";
import {
  SubscriptionPlan,
  USER_STATUS,
  UserStatus,
} from "../modules/users/constant.user";
import config from "../config/index";
import { IUser } from "../modules/users/interface.user";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: missing token" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

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

    if (user.subscription?.expiresAt) {
      const now = new Date();

      if (user.subscription.expiresAt < now) {
        user.subscription.plan = "free";
        user.subscription.isActive = false;
        await user.save();
      }
    }

    req.user = user;

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
