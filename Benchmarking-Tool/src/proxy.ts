import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/invitations"
  ]
  if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const access = req.cookies.get("access")?.value;
  const refresh = req.cookies.get("refresh")?.value;

  if (access) return NextResponse.next();
  if (!refresh) return NextResponse.next();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/token-refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("access");
    response.cookies.delete("refresh");
    return response;
  }

  const { access: newAccess, refresh: newRefresh } = await res.json();

  const response = NextResponse.next();
  response.cookies.set("access", newAccess, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });
  response.cookies.set("refresh", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
