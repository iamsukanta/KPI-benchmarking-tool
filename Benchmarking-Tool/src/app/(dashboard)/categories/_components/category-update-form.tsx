"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categorySchema, CategoryFormData } from "@/lib/validators/category";
import { retrieveCategory, updateCategory } from "@/lib/api/categories";
import { Category } from "@/lib/types/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faArrowLeft,
  faSave,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

export default function CategoryUpdateForm({ id }: { id: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>();
  const [form, setForm] = useState<CategoryFormData>({
    name: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { results } = await retrieveCategory(id);
        setCategory(results);
        setForm(results);
      } catch {
        setErrors({ form: "Kategoriedaten konnten nicht geladen werden." });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

    const result = categorySchema.safeParse(form);

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

    try {
      await updateCategory(id, result.data);
      router.replace("/categories");
    } catch (error: unknown) {
      if (error instanceof Error) setErrors({ form: error.message });
      else setErrors({ form: "Die Kategorie konnte nicht gespeichert werden." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            <span>Zurück zu den Kategorien</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faLayerGroup} className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded animate-pulse w-64 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-48"></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          <span>Zurück zu den Kategorien</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faLayerGroup} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kategorie aktualisieren</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {category?.name || "Kategoriedetails bearbeiten"}
            </p>
          </div>
        </div>
      </div>

      {errors.form && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Fehler</h3>
            <p className="text-sm text-red-600 mt-1">{errors.form}</p>
          </div>
          <button
            onClick={() => setErrors(prev => ({ ...prev, form: "" }))}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
          <div>
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="name"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-slate-500" />
              Kategoriename
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Geben Sie den Kategorienamen ein"
              className={`w-full px-4 py-3 rounded-lg bg-white border ${
                errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
              } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
            />

            {errors.name && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/categories"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Stornieren
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-600
              text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-400
              disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aktualisierung...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                  <span>Kategorie aktualisieren</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
