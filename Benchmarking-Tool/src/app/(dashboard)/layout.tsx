import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/styles/globals.scss";
import { AuthProvider } from "@/context/auth-context";
import Main from '@/app/(dashboard)/main';

const sourceSans = localFont({
  src: "../fonts/SourceSans3-latin.woff2",
  variable: "--font-source-sans",
  weight: "300 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Volulink",
    default: "Volulink"
  },
  description: "Benchmarking tool created by VoluLink",
};

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body
        className={`${sourceSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Main>
            {children}
          </Main>
        </AuthProvider>
      </body>
    </html>
  );
}
