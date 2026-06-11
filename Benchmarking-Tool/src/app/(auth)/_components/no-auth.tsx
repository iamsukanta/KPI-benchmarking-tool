"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/styles/globals.scss";
import { AuthProvider } from "@/context/auth-context";
import Public from "@/components/public";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800']
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
