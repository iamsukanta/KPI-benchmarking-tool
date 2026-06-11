"use client";

import { useEffect, useState } from "react";
import { loadProfile, updateProfile } from '@/lib/api/auth';
import { profileSchema, ProfileFormData } from '@/lib/validators/auth';
import { useSuccess } from '@/components/notify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faSave,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/auth-context';

export default function ProfileForm() {
  const { setUser, user } = useAuth();
  const { success, showSuccess } = useSuccess();
  const [form, setForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { results } = await loadProfile();
        setForm(results);
      } catch {
        setErrors({ form: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

    const result = profileSchema.safeParse(form);

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

    const { status } = await updateProfile(result.data);
    if (status === 'success') {
      showSuccess('Ihr profil wurde erfolgreich aktualisiert.');
      const userUpdatedData = {
        id: user?.id as number,
        name: form.first_name,
        email: form.email,
        role: user?.role as string
      }
      setUser(userUpdatedData);
      localStorage.setItem('user', JSON.stringify(userUpdatedData));
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-11 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
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
            htmlFor="first_name"
          >
            <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-slate-500" />
            Vorname
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleInputChange}
            placeholder="Geben sie ihren vornamen ein"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
          />

          {errors.first_name && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
              {errors.first_name}
            </p>
          )}
        </div>

        <div>
          <label
            className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
            htmlFor="last_name"
          >
            <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-slate-500" />
            Nachname
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleInputChange}
            placeholder="Geben sie ihren nachnamen ein"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
          />

          {errors.last_name && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
              {errors.last_name}
            </p>
          )}
        </div>

        <div>
          <label
            className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
            htmlFor="email"
          >
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-slate-500" />
            E-Mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Geben sie ihre e-mail-addresse ein"
            className={`w-full px-4 py-3 rounded-lg bg-white border ${
              errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
          />

          {errors.email && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg
          bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800
          disabled:bg-brand-400 disabled:cursor-not-allowed transition-colors
          shadow-sm hover:shadow cursor-pointer"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Aktualisierung...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Änderungen Speichern</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
