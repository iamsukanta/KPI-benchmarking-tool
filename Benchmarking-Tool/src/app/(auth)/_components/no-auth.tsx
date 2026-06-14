"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/styles/globals.scss";
import { AuthProvider } from "@/context/auth-context";
import Public from "@/components/public";

const inter = localFont({
  src: "../../fonts/Inter-latin.woff2",
  variable: "--font-inter",
  weight: "400 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoluLink",
  description: "Benchmarking tool created by VoluLink",
};

export default function NoAuth({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Public>{children}</Public>
    </AuthProvider>
  );
}
