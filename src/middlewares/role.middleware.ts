import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowed: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (!allowed.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};
