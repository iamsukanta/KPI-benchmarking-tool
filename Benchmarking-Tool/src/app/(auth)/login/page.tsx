import LoginForm from "@/app/(auth)/_components/loginForm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const access = (await cookies()).get("access")?.value;
  if (access) redirect("/");

  return <LoginForm />;
}
