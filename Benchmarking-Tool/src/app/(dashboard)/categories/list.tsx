"use client";

import CategoryTable from "@/app/(dashboard)/categories/_components/category-table";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types/facilities';
import { destroyCategory, getAllCategories } from '@/lib/api/categories';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLayerGroup, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function CategoryList() {
  const { user } = useAuth();

  const [error, setError] = useState<string>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const { results } = await getAllCategories();
        setCategories(results || []);
      } catch {
        setError('Kategorien konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function onDelete(id: number) {
    try {
      const res = await destroyCategory(id.toString());
      if (res.status !== 'success') {
        setError(res.message);
      } else {
        const newCategories = [...categories].filter(cat => cat.id !== id);
        setCategories(newCategories);
        setError(undefined);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unbekannter Fehler.');
      }
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Fehler</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(undefined)}
            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kategorien</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Alle Kategorien verwalten und anzeigen
              {categories.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-700">
                  {categories.length} {categories.length === 1 ? 'kategorie' : 'Kategorien'}
                </span>
              )}
            </p>
          </div>
        </div>

        {user?.role === "admin" && (
          <Link
            href="/categories/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white
            text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 transition-all duration-150
            shadow-sm hover:shadow-md"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>Kategorie erstellen</span>
          </Link>
        )}
      </div>

      <div className="overflow-x-scroll">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-500">Kategorien werden geladen...</p>
          </div>
        ) : (
          <CategoryTable data={categories} onDeleteAction={onDelete} />
        )}
      </div>
    </div>
  );
}
