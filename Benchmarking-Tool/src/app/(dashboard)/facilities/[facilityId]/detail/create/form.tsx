"use client";

import React, { Dispatch, SetStateAction } from "react";
import { FacilityDetailFormData } from "@/lib/validators/facility";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCalendarWeek,
  faMoneyBillTrendUp,
  faCheck,
  faExclamationCircle,
  faUsers,
  faDoorOpen,
  faUserTie,
  faUtensils,
  faBolt,
  faBroom,
  faWrench,
  faHandHoldingHeart,
  faMicrophone,
  faCutlery,
  faHotel,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';

type FieldConfig = {
  name: keyof FacilityDetailFormData;
  label: string;
  placeholder: string;
  icon: any;
  optional?: boolean;
};

const coreFields: FieldConfig[] = [
  { name: "year", label: "Jahr", placeholder: "e.g. " + new Date().getFullYear(), icon: faCalendarWeek },
  { name: "overnight_stays", label: "Übernachtungen", placeholder: "Übernachtungen im Laufe eines Jahres", icon: faBed },
  { name: "guests", label: "Anzahl der Ankünfte", placeholder: "Gesamtzahl der Gästeankünfte", icon: faUsers },
  { name: "rooms_sold", label: "Zimmer verkauft", placeholder: "Insgesamt verkaufte Zimmer", icon: faDoorOpen, optional: true },
  { name: "total_revenue", label: "Gesamtumsatz", placeholder: "Gesamtumsatz in einem Jahr", icon: faMoneyBillTrendUp },
];

const costFields: FieldConfig[] = [
  { name: "personnel_costs", label: "Personalkosten", placeholder: "Gesamte Personalkosten", icon: faUserTie },
  { name: "catering_costs", label: "Warenkosten / Cateringkosten", placeholder: "Kosten für Verpflegung und Waren", icon: faUtensils },
  { name: "energy_costs", label: "Energiekosten", placeholder: "Gesamtenergiekosten", icon: faBolt },
  { name: "cleaning_costs", label: "Reinigungskosten", placeholder: "Gesamte Reinigungskosten", icon: faBroom, optional: true },
  { name: "maintenance_costs", label: "Sachkosten (gesamt)", placeholder: "Wartungs- und Betriebskosten", icon: faWrench },
];

const incomeFields: FieldConfig[] = [
  { name: "income_from_donations", label: "Einnahmen aus Spenden", placeholder: "Optional", icon: faHandHoldingHeart, optional: true },
  { name: "income_from_conferences", label: "Einnahmen aus Konferenzen", placeholder: "Optional", icon: faMicrophone, optional: true },
  { name: "income_from_catering", label: "Einnahmen aus der Gastronomie", placeholder: "Optional", icon: faCutlery, optional: true },
  { name: "income_from_accomodation", label: "Einkünfte aus Beherbergung", placeholder: "Optional", icon: faHotel, optional: true },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-3 border-b border-slate-200 mb-5">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function FacilityDetailCreateForm({
  id,
  form,
  setFormAction,
  errors,
  setErrorsAction,
  onSubmitAction,
  submitting
}: {
  id: string;
  form: FacilityDetailFormData;
  setFormAction: Dispatch<SetStateAction<FacilityDetailFormData>>,
  setErrorsAction: Dispatch<SetStateAction<Record<string, string>>>,
  errors: Record<string, string>;
  onSubmitAction: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormAction(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrorsAction(prev => ({ ...prev, [name]: "" }));
    }
  }

  function handleToggle() {
    setFormAction(prev => ({ ...prev, is_published: !prev.is_published }));
  }

  function renderField({ name, label, placeholder, icon, optional }: FieldConfig) {
    const hasError = !!errors[name as string];
    return (
      <div key={name as string}>
        <label
          className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700"
          htmlFor={name as string}
        >
          <FontAwesomeIcon icon={icon} className="w-4 h-4 text-slate-500" />
          {label}
          {optional && (
            <span className="ml-1 text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Optional
            </span>
          )}
        </label>
        <input
          type="number"
          id={name as string}
          name={name as string}
          value={(form[name] as string) ?? ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg bg-white border ${hasError
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors`}
        />
        {hasError && (
          <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5 flex-shrink-0" />
            {errors[name as string]}
          </p>
        )}
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
          <button
            onClick={() => setErrorsAction(prev => ({ ...prev, form: "" }))}
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
        <form onSubmit={onSubmitAction} noValidate className="p-6 space-y-8">

          <section>
            <SectionHeader title="Core Metrics" subtitle="Key operational figures for the year" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {coreFields.map(renderField)}
            </div>
          </section>

          <section>
            <SectionHeader title="Operating Costs" subtitle="Annual expenditure breakdown" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {costFields.map(renderField)}
            </div>
          </section>

          <section>
            <SectionHeader title="Additional Income Sources" subtitle="Optional — fill in if applicable" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {incomeFields.map(renderField)}
            </div>
          </section>

          <section className="pt-2">
            <div
              className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={handleToggle}
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">Veröffentlichen Sie diesen Datensatz</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.is_published ? "Diese jährlichen Daten werden für andere sichtbar sein." : "Diese Jahresdaten bleiben als Entwurf bestehen."}
                </p>
              </div>
              <FontAwesomeIcon
                icon={form.is_published ? faToggleOn : faToggleOff}
                className={`w-8 h-8 transition-colors ${form.is_published ? 'text-brand-600' : 'text-slate-400'}`}
              />
            </div>
          </section>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <Link
              href={`/facilities/${id}/detail`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Stornieren
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800
              disabled:bg-brand-400 disabled:cursor-not-allowed transition-colors shadow-sm
              hover:shadow cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Hinzufügen...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  <span>Details hinzufügen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
