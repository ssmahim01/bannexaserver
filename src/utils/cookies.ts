import { Response } from "express";

const REFRESH_COOKIE_NAME = "bannexa_refresh";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as "lax",
  path: "/",
  // maxAge set when cookie is written
};

export function setRefreshCookie(res: Response, token: string, maxAgeSeconds = 24 * 3600) {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: maxAgeSeconds * 1000 });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
}
