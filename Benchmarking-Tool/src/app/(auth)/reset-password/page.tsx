import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Passwort zurücksetzen
        </h1>
      </div>

      <form className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-300" htmlFor="password">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-300" htmlFor="confirmPassword">
            Passwort bestätigen
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
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
    </div>
  );
}
