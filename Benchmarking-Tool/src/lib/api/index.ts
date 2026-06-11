import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function serverFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;

  const makeRequest = (token: string | undefined) =>
    fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

  let res = await makeRequest(access);

  if (res.status === 401) {
    throw new Error("Session expired");
  }

  return res;
}
