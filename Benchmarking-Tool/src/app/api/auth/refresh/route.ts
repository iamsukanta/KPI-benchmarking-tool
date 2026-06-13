import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookie-options";

export async function POST(req: NextRequest) {
  const oldRefresh = (await cookies()).get("refresh")?.value;

  if (!oldRefresh) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const remoteRes = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/token-refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: oldRefresh }),
  });

  if (!remoteRes.ok) {
    const response = NextResponse.json({ message: "Session expired" }, { status: 401 });
    response.cookies.delete("access");
    response.cookies.delete("refresh");
    return response;
  }

  const { access, refresh } = await remoteRes.json();
  const response = NextResponse.json({ success: true });

  response.cookies.set("access", access, accessCookieOptions);
  response.cookies.set("refresh", refresh, refreshCookieOptions);

  return response;
}
