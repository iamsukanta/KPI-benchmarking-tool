"use client";

import { useState } from "react";
import { changePassword } from '@/lib/api/auth';
import { changePasswordSchema, ChangePasswordFormData } from '@/lib/validators/auth';
import { useSuccess } from '@/components/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faKey,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function ChangePasswordForm() {
  const { success, showSuccess } = useSuccess();
  const [form, setForm] = useState<ChangePasswordFormData>({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = changePasswordSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0];
        if (field) fieldErrors[field as string] = issue.message;
      });

      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    const res = await changePassword(result.data);
    if (res.status === 'success') {
      showSuccess('Your password has been changed successfully.');
      // Clear form
      setForm({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
      });
    } else {
      const fieldErrors: Record<string, string> = {};
      Object.entries(res.errors).forEach(([key, value]) => {
        if (value?.length) {
          fieldErrors[key] = value.join(", ");
        }
      });
      setErrors(fieldErrors);
    }
    setSubmitting(false);
  }

  return (
    <>
      {errors.form && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Fehler</h3>
            <p className="text-sm text-red-600 mt-1">{errors.form}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Erfolg</h3>
            <p className="text-sm text-green-600 mt-1">{success}</p>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
            htmlFor="old_password"
          >
            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-slate-500" />
            Aktuelles Passwort
          </label>
          <input
            type="password"
            id="old_password"
            name="old_password"
            value={form.old_password}
            onChange={handleInputChange}
            placeholder="Geben sie ihr aktuelles passwort ein"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.old_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
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
          <label
            className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
            htmlFor="new_password"
          >
            <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-slate-500" />
            Neues Passwort
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={form.new_password}
            onChange={handleInputChange}
            placeholder="Geben sie ihr neues passwort ein"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.new_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
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
          <label
            className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
            htmlFor="confirm_new_password"
          >
            <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-slate-500" />
            Bestätigen Sie das neue Passwort
          </label>
          <input
            type="password"
            id="confirm_new_password"
            name="confirm_new_password"
            value={form.confirm_new_password}
            onChange={handleInputChange}
            placeholder="Bestätigen sie ihr neues passwort"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.confirm_new_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
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
              <span>Ändern...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faKey} className="w-4 h-4" />
              <span>Kennwort ändern</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
