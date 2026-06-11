"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { loginAction, LoginState } from "@/app/(auth)/login/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const initialState: LoginState = { errors: {} };

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, initialState);
  const errors = state.errors;

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
      <div className="flex flex-col w-full max-w-md py-10">
        <div className="md:hidden mb-6 flex justify-center drop-shadow-[0_0_18px_rgba(255,140,0,0.4)]">
          <Image
            src="/logo.png"
            alt="VoluLink Benchmarking Tool"
            width={220}
            height={220}
            priority
          />
        </div>

        <div className="mb-10 text-center">
          <h1 className="md:hidden text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent mb-2">
            Benchmarking Tool
          </h1>
          <h1 className="hidden md:block text-5xl font-bold tracking-tight text-white mb-3">
            Willkommen
          </h1>
          <p className="text-base text-slate-400">Melden Sie sich in Ihrem Konto an</p>
        </div>

        {errors.form && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center">{errors.form}</p>
          </div>
        )}

        <form className="w-full space-y-6" action={action} noValidate>
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="email">
              E-Mail-Adresse
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className={`${errors.email ? "text-red-400" : "text-slate-500 group-focus-within:text-amber-400"} transition-colors duration-200`}
                />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue=""
                placeholder="you@example.com"
                className={`w-full pl-11 pr-4 h-12 rounded-lg bg-slate-800/50 text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 text-sm transition-all duration-200 border shadow-sm
                  hover:bg-slate-800/70 hover:shadow-md ${errors.email
                    ? "border-red-400/60 focus:ring-red-400/50 focus:border-red-400"
                    : "border-slate-700/50 focus:ring-amber-400/50 focus:border-amber-400"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="password">
              Passwort
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faLock}
                  className={`${errors.password ? "text-red-400" : "text-slate-500 group-focus-within:text-amber-400"} transition-colors duration-200`}
                />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 h-12 rounded-lg bg-slate-800/50 text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 text-sm transition-all duration-200 border shadow-sm
                  hover:bg-slate-800/70 hover:shadow-md ${errors.password
                    ? "border-red-400/60 focus:ring-red-400/50 focus:border-red-400"
                    : "border-slate-700/50 focus:ring-amber-400/50 focus:border-amber-400"
                  }`}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700
            text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2
            active:scale-[0.98] cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Anmelden...
              </span>
            ) : (
              "Anmelden"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Sie haben noch kein Konto?
          <Link
            href="/signup"
            className="ml-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
          >
            Melden Sie sich an
          </Link>
        </p>
      </div>
    </div>
  );
}
