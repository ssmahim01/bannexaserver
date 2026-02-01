
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../modules/users/model.user";
import { USER_STATUS, UserStatus } from "../modules/users/constant.user";
import { isTokenBlacklisted, getUserTokenVersion } from "../utils/tokenBlacklist";
import config from "../config/index";

interface DecodedToken extends JwtPayload {
  id: string;
  tokenVersion?: number;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken =
      req.cookies?.bannexa_token || req.cookies?.bannexa_refresh;

    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (typeof cookieToken === "string") {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: missing token" });
    }

    // Check blacklist (logout / revoke)
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(
        token,
        config.jwt.accessSecret
      ) as DecodedToken;
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!decoded?.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Token version check (force logout everywhere)
    if (decoded.tokenVersion !== undefined) {
      const currentVersion = await getUserTokenVersion(decoded.id);
      if (decoded.tokenVersion < currentVersion) {
        return res.status(401).json({
          error: "Session expired. Please login again.",
        });
      }
    }

    // Fetch user from MongoDB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Status check
   const inactiveStatuses: UserStatus[] = [
  USER_STATUS.BLOCK,
  USER_STATUS.SUSPEND,
];

if (inactiveStatuses.includes(user.status)) {
  return res.status(403).json({ error: "Account inactive" });
}

    // Attach to request
    req.user = {
      id: user._id.toString(),
      ...user.toObject(),
    };

    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(500).json({ error: "Internal authentication error" });
  }
}