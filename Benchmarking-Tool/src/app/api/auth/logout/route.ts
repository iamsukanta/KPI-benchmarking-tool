import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh")?.value;
  const access = cookieStore.get("access")?.value;

  if (refresh) {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access}`,
      },
      body: JSON.stringify({ token: refresh }),
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access");
  response.cookies.delete("refresh");
  response.cookies.delete("user");
  return response;
}
