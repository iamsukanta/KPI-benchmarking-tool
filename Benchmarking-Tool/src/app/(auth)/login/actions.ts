"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validators/auth";
import { AuthResponse } from "@/lib/types/auth";

export type LoginState = {
  errors: Record<string, string>;
};

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field) errors[field] = issue.message;
    });
    return { errors };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
  } catch {
    return { errors: { form: "Netzwerkfehler, bitte versuchen Sie es erneut." } };
  }

  if (!res.ok) {
    const error = await safeJson<{ message?: string }>(res);
    return { errors: { form: error?.message || "Ungültige Anmeldedaten." } };
  }

  const data = await safeJson<AuthResponse>(res);
  if (!data?.access || !data?.refresh) {
    return { errors: { form: "Ungültige Serverantwort." } };
  }

  const cookieStore = await cookies();

  cookieStore.set("access", data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  cookieStore.set("refresh", data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  cookieStore.set("user", JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role, change_password_at_first_login: data.change_password_at_first_login ?? false }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
}
