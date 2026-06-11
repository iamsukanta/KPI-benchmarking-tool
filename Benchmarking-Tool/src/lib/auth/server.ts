import { cookies } from "next/headers";
import { AuthUser } from "@/lib/types/auth";

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user")?.value;

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
