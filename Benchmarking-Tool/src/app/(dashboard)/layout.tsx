import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "@/app/styles/globals.scss";
import { AuthProvider } from "@/context/auth-context";
import Main from '@/app/(dashboard)/main';

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["300", "400", "600", "700", "800"],
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
