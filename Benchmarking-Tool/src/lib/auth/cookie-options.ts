const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const USER_MAX_AGE = 60 * 60 * 24 * 30;

// Secure cookies are dropped by browsers over plain HTTP. NODE_ENV cannot be
// relied on here because `next start` always forces it to "production", so the
// flag is driven by COOKIE_SECURE. Defaults to secure; set COOKIE_SECURE=false
// when serving over HTTP (e.g. an IP-only VPS without TLS).
const cookieSecure = process.env.COOKIE_SECURE !== "false";

export const accessCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: "lax" as const,
  maxAge: ACCESS_MAX_AGE,
  path: "/",
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: "lax" as const,
  maxAge: REFRESH_MAX_AGE,
  path: "/",
};

export const userCookieOptions = {
  httpOnly: false,
  secure: cookieSecure,
  sameSite: "lax" as const,
  maxAge: USER_MAX_AGE,
  path: "/",
};
