"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/api/auth";
import { changePasswordSchema, ChangePasswordFormData } from "@/lib/validators/auth";
import { useAuth } from "@/context/auth-context";
import { AuthUser } from "@/lib/types/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faKey,
  faExclamationCircle,
  faShieldHalved,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function persistFlagCleared(user: AuthUser): AuthUser {
  const updated: AuthUser = { ...user, change_password_at_first_login: false };
  document.cookie = `user=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  return updated;
}

export default function ForcedPasswordChange() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ChangePasswordFormData>({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = changePasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) fieldErrors[field as string] = issue.message;
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      const res = await changePassword(result.data);
      if (res.status === "success") {
        if (user) setUser(persistFlagCleared(user));
        router.refresh();
      } else {
        const fieldErrors: Record<string, string> = {};
        Object.entries(res.errors).forEach(([key, value]) => {
          if (value?.length) fieldErrors[key] = value.join(", ");
        });
        setErrors(fieldErrors);
      }
    } catch {
      setErrors({ form: "Das Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/60 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Passwortänderung erforderlich</h1>
            <p className="text-sm text-slate-500 mt-1">
              Bitte legen Sie ein neues Passwort fest, um Ihr Konto zu aktivieren und fortzufahren.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700" htmlFor="old_password">
                <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-slate-500" />
                Temporäres Passwort
              </label>
              <input
                type="password"
                id="old_password"
                name="old_password"
                value={form.old_password}
                onChange={handleInputChange}
                placeholder="Aus der E-Mail mit den Zugangsdaten"
                className={`w-full px-4 py-3 rounded-lg bg-white border ${
                  errors.old_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.old_password && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {errors.old_password}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700" htmlFor="new_password">
                <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-slate-500" />
                Neues Passwort
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={form.new_password}
                onChange={handleInputChange}
                placeholder="Mindestens 8 Zeichen"
                className={`w-full px-4 py-3 rounded-lg bg-white border ${
                  errors.new_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.new_password && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {errors.new_password}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700" htmlFor="confirm_new_password">
                <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-slate-500" />
                Neues Passwort bestätigen
              </label>
              <input
                type="password"
                id="confirm_new_password"
                name="confirm_new_password"
                value={form.confirm_new_password}
                onChange={handleInputChange}
                placeholder="Neues Passwort wiederholen"
                className={`w-full px-4 py-3 rounded-lg bg-white border ${
                  errors.confirm_new_password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.confirm_new_password && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {errors.confirm_new_password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800
              disabled:bg-brand-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Wird gespeichert…</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faKey} className="w-4 h-4" />
                  <span>Passwort festlegen &amp; fortfahren</span>
                </>
              )}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
