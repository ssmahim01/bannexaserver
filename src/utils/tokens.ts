import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { getUserTokenVersion } from "./tokenBlacklist";

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "please_change_me";

export interface TokenPayload {
  id: string;
  role?: string;
  tokenVersion?: number;
  type?: "access" | "refresh";
}

export function signJwt(payload: object, expiresIn: string | number = "24h") {
  return jwt.sign(
    payload as jwt.JwtPayload,
    JWT_SECRET as jwt.Secret,
    { expiresIn } as SignOptions,
  );
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as T;
  } catch (err) {
    return null;
  }
}

export function decodeJwt<T = any>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch (err) {
    return null;
  }
}

export async function signAccessToken(userId: string, role: string): Promise<string> {
  const tokenVersion = await getUserTokenVersion(userId);
  return signJwt({ id: userId, role, tokenVersion, type: "access" }, "24h");
}

export async function signRefreshToken(userId: string, role: string): Promise<string> {
  const tokenVersion = await getUserTokenVersion(userId);
  return signJwt({ id: userId, role, tokenVersion, type: "refresh" }, "7d");
}

export function getTokenExpiry(token: string): number | null {
  const decoded = decodeJwt<JwtPayload>(token);
  return decoded?.exp || null;
}

export function getTokenRemainingTime(token: string): number {
  const exp = getTokenExpiry(token);
  if (!exp) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, exp - now);
}

