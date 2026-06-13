"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { facilitySchema, FacilityFormData } from "@/lib/validators/facility";
import { getAllCategories, getAllFederations, createFacility } from "@/lib/api/facilities";
import { Category, Facility } from "@/lib/types/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDoorOpen,
  faBed,
  faTag,
  faCheck,
  faExclamationCircle,
  faSitemap,
  faLandmark,
  faRulerCombined,
  faCalendarDays,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import SearchableSelect from "@/components/searchable-select";
import { GERMAN_STATES } from "@/lib/constants/germany";

export default function FacilityCreateForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>();
  const [federations, setFederations] = useState<{ label: string; value: string }[] | null>(null);
  const [federationsLoading, setFederationsLoading] = useState(false);
  const [form, setForm] = useState<FacilityFormData>({
    name: "",
    region: "",
    beds: "",
    rooms: "",
    category: "",
    is_federation: false,
    federation: "",
    opening_days_per_year: "",
    operational_building_area: "",
    total_property_area: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { results } = await getAllCategories();
      setCategories(results);

      if (!federations) {
        setFederationsLoading(true);
        try {
          const { results } = await getAllFederations();
          setFederations(
            (results ?? []).map((f) => ({
              label: f.name,
              value: f.id.toString(),
            }))
          );
        } catch {
          setFederations([]);
        } finally {
          setFederationsLoading(false);
        }
      }
    }
    load();
  }, []);

  function handleSelectChange(name: string, value: string) {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  function handleFederationToggle() {
    setForm(prev => ({
      ...prev,
      is_federation: !prev.is_federation,
      ...(!prev.is_federation ? { rooms: "", beds: "" } : {}),
    }));
    setErrors(prev => ({ ...prev, rooms: "", beds: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = facilitySchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      console.log(result.error.issues);
      result.error.issues.forEach(issue => {
        const field = issue.path[0];
        if (field) fieldErrors[field as string] = issue.message;
      });

      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      const { rooms, beds, federation, operational_building_area, total_property_area, ...rest } = result.data;
      const payload = result.data.is_federation
      ? {
        ...rest,
        ...(operational_building_area ? { operational_building_area } : {}),
        ...(total_property_area ? { total_property_area } : {}),
      } : {
        rooms, beds, ...rest,
        ...(federation !== "0" ? { federation } : { federation: "" }),
        ...(operational_building_area ? { operational_building_area } : {}),
        ...(total_property_area ? { total_property_area } : {}),
      };
      await createFacility(payload);
      router.replace("/facilities");
    } catch (error: unknown) {
      if (error instanceof Error) setErrors({ form: error.message });
      else setErrors({ form: "Failed to create facility." });
    } finally {
      setSubmitting(false);
    }
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
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faSitemap} className="w-4 h-4 text-brand-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Es ist ein Verband</p>
                <p className="text-xs text-slate-500 mt-0.5">Verbände erfassen keine Zimmer oder Betten</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_federation}
              onClick={handleFederationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${form.is_federation ? 'bg-brand-600' : 'bg-slate-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_federation ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div>
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="category"
            >
              <FontAwesomeIcon icon={faTag} className="w-4 h-4 text-slate-500" />
              Kategorie
            </label>

            {!categories ? (
              <div className="animate-pulse">
                <div className="h-11 bg-slate-200 rounded"></div>
              </div>
            ) : (
              <SearchableSelect
                name="category"
                value={form.category}
                placeholder="Kategorie auswählen…"
                options={categories.map(category => ({
                  label: category.name,
                  value: category.id.toString(),
                }))}
                error={!!errors.category}
                onChange={handleSelectChange}
              />
            )}

            {errors.category && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="name"
            >
              <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-slate-500" />
              Name der Einrichtung
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter facility name"
              className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
            />
            {errors.name && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="opening_days_per_year"
            >
              <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-slate-500" />
              Öffnungstage pro Jahr
            </label>
            <input
              type="number"
              id="opening_days_per_year"
              name="opening_days_per_year"
              value={form.opening_days_per_year}
              onChange={handleInputChange}
              placeholder="Enter opening days per year"
              className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.opening_days_per_year ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
            />
            {errors.opening_days_per_year && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {errors.opening_days_per_year}
              </p>
            )}
          </div>

          <div>
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="region"
            >
              <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-slate-500" />
              Region (Bundesland)
            </label>
            <SearchableSelect
              name="region"
              value={form.region}
              placeholder="Bundesland auswählen…"
              options={GERMAN_STATES}
              error={!!errors.region}
              onChange={handleSelectChange}
            />
            {errors.region && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {errors.region}
              </p>
            )}
          </div>

          {! form.is_federation && (
            <label
              className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
              htmlFor="federation"
            >
              <FontAwesomeIcon icon={faSitemap} className="w-4 h-4 text-slate-500" />
              Föderation
            </label>
          )}

          {federationsLoading ? (
            <div className="w-full h-12 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-slate-400">Verbände werden geladen...</span>
            </div>
          ) : ! form.is_federation && (
            <SearchableSelect
              name="federation"
              placeholder="Föderation auswählen…"
              options={federations ?? []}
              error={!!errors.federation}
              onChange={handleSelectChange}
            />
          )}

          {!form.is_federation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
                  htmlFor="rooms"
                >
                  <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-cyan-500" />
                  Zimmer
                </label>
                <input
                  type="number"
                  id="rooms"
                  name="rooms"
                  value={form.rooms}
                  onChange={handleInputChange}
                  placeholder="Number of rooms"
                  className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.rooms ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-cyan-500 focus:border-cyan-500'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
                {errors.rooms && (
                  <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                    <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                    {errors.rooms}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
                  htmlFor="beds"
                >
                  <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-violet-500" />
                  Betten
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  value={form.beds}
                  onChange={handleInputChange}
                  placeholder="Number of beds"
                  className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.beds ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-violet-500 focus:border-violet-500'
                    } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
                {errors.beds && (
                  <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                    <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                    {errors.beds}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
                htmlFor="operational_building_area"
              >
                <FontAwesomeIcon icon={faRulerCombined} className="w-4 h-4 text-emerald-500" />
                Betriebsgebäudebereich
              </label>
              <input
                type="number"
                id="operational_building_area"
                name="operational_building_area"
                value={form.operational_building_area}
                onChange={handleInputChange}
                placeholder="Total building area in m²"
                className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.operational_building_area ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.operational_building_area && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {errors.operational_building_area}
                </p>
              )}
            </div>

            <div>
              <label
                className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
                htmlFor="total_property_area"
              >
                <FontAwesomeIcon icon={faLandmark} className="w-4 h-4 text-amber-500" />
                Gesamtgrundstücksfläche
              </label>
              <input
                type="number"
                id="total_property_area"
                name="total_property_area"
                value={form.total_property_area}
                onChange={handleInputChange}
                placeholder="Total open/outdoor area in m²"
                className={`w-full px-4 py-3 rounded-lg bg-white border ${errors.total_property_area ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-amber-500 focus:border-amber-500'
                  } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.total_property_area && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {errors.total_property_area}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/facilities"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Stornieren
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Erstellen...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  <span>Einrichtung erstellen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
