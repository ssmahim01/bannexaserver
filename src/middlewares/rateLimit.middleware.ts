import { Request, Response, NextFunction } from "express";

const windowMs = 60 * 1000; 
const maxRequests = 60;
const store = new Map<string, { count: number; firstAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || (req.headers["x-forwarded-for"] as string) || "global";
    const entry = store.get(key) || { count: 0, firstAt: Date.now() };
    if (Date.now() - entry.firstAt > windowMs) {
      entry.count = 0;
      entry.firstAt = Date.now();
    }
    entry.count++;
    store.set(key, entry);
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests, slow down" });
    }
    next();
  } catch {
    next();
  }
}
