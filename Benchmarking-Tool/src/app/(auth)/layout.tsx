import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/styles/globals.scss";
import NoAuth from "./_components/no-auth";
import Image from 'next/image';

const sourceSans = localFont({
  src: "../fonts/SourceSans3-latin.woff2",
  variable: "--font-source-sans",
  weight: "300 800",
  display: "swap",
});

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '%s | Volulink',
    default: 'Volulink'
  }
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body className={`${sourceSans.variable} antialiased`} suppressHydrationWarning>
        <section
          className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white min-h-screen flex items-center justify-center p-4 md:p-7 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-700/5 rounded-full blur-3xl"></div>
          </div>

          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>

          <div className="container mx-auto flex flex-col md:flex-row items-stretch md:justify-between gap-8 md:gap-16 relative z-10 max-w-7xl">
            <div className="pr-10 w-full md:w-1/2 hidden md:flex flex-col justify-center items-center relative">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-amber-400/40 animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-amber-300/30 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-amber-500/20 animate-pulse" style={{ animationDelay: '2s' }}></div>

              <div className="mb-8 flex justify-center relative group">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-500"></div>
                <div className="relative drop-shadow-[0_0_25px_rgba(255,140,0,0.45)]">
                  <Image
                    src="/logo.png"
                    alt="VoluLink Benchmarking Tool"
                    width={240}
                    height={240}
                    priority
                    className="relative z-10"
                  />
                </div>
              </div>

              <div className="text-center space-y-3 max-w-md">
                <h1 className="text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    Benchmarking Tool
                  </span>
                </h1>
                <p className="text-slate-400 text-base leading-relaxed">
                  Leistungsstarke Einblicke und Analysen für Ihre Unternehmensleistung
                </p>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700/50 to-transparent"></div>
            </div>

            <NoAuth>{children}</NoAuth>
          </div>
        </section>
      </body>
    </html>
  );
}
