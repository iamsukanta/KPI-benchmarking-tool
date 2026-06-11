"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Public({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, router]);
  return ! isAuthenticated ? children : null;
}
