import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PUBLIC_PATHS = new Set([
  "auth/login",
  "auth/signup",
  "auth/token-refresh",
  "unapproved-federations",
  "unapproved-facilities",
  "auth/user-invitations"
]);

function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true;
  return [...PUBLIC_PATHS].some((p) => path.startsWith(`${p}/`));
}

function buildHeaders(
  req: NextRequest,
  access?: string,
  isPublic?: boolean
): HeadersInit {
  const contentType = req.headers.get("content-type") ?? "";
  const isMultipart = contentType.startsWith("multipart/form-data");

  return {
    ...(!isMultipart && { "Content-Type": contentType || "application/json" }),
    ...(!isPublic && access && { Authorization: `Bearer ${access}` }),
  };
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function buildBody(req: NextRequest): Promise<BodyInit | undefined> {
  if (req.method === "GET") return undefined;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    return await req.formData();
  }

  return await req.text();
}

async function forwardRequest(
  req: NextRequest,
  path: string,
  search: string,
  body: BodyInit | undefined,
  access?: string,
  isPublic?: boolean
): Promise<Response> {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/${path}/${search}`,
    {
      method: req.method,
      headers: buildHeaders(req, access, isPublic),
      body,
    }
  );
}

async function tryRefresh(
  refresh: string
): Promise<{ newAccess: string; newRefresh: string } | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/token-refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }
  );

  if (!res.ok) return null;

  const result = await res.json();
  return { newAccess: result.access, newRefresh: result.refresh };
}

function setTokenCookies(
  response: NextResponse,
  tokens: { newAccess: string; newRefresh: string }
) {
  response.cookies.set("access", tokens.newAccess, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });
  response.cookies.set("refresh", tokens.newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const search = new URL(req.url).search;
  const isPublic = isPublicPath(path);

  const cookieStore = await cookies();
  let access = cookieStore.get("access")?.value;
  const refresh = cookieStore.get("refresh")?.value;

  if (!isPublic && !access && !refresh) {
    console.log('here', access);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let refreshedTokens: { newAccess: string; newRefresh: string } | null = null;

  if (!isPublic && !access && refresh) {
    refreshedTokens = await tryRefresh(refresh);
    if (!refreshedTokens) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }
    access = refreshedTokens.newAccess;
  }

  const body = await buildBody(req);
  const remoteRes = await forwardRequest(req, path, search, body, access, isPublic);

  if (!isPublic && remoteRes.status === 401 && !refreshedTokens) {
    if (!refresh) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    refreshedTokens = await tryRefresh(refresh);
    if (!refreshedTokens) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const retryRes = await forwardRequest(
      req,
      path,
      search,
      body,
      refreshedTokens.newAccess,
      isPublic
    );

    const retryData = await safeJson(retryRes);
    const response = NextResponse.json(retryData, { status: retryRes.status });
    setTokenCookies(response, refreshedTokens);
    return response;
  }

  const data = await safeJson(remoteRes);
  const response = NextResponse.json(data, { status: remoteRes.status });

  if (refreshedTokens) {
    setTokenCookies(response, refreshedTokens);
  }

  return response;
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
