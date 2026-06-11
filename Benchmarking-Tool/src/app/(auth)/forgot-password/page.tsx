import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Passwort vergessen"
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Passwort vergessen?
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Wir sind für Sie da
        </p>
      </div>

      <form className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-300" htmlFor="email">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover transition font-semibold cursor-pointer"
        >
          Einreichen
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="ml-1 text-primary hover:text-primary-hover font-medium">
          Melden Sie sich beim Benutzerkonto an
        </Link>
      </p>
    </div>
  );
}
