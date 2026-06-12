"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { FacilityDetailFormData } from "@/lib/validators/facility";
import { isV2Eligible } from "@/lib/facility-v2";
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
  faChevronDown,
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
  { name: "total_revenue", label: "Gesamtumsatz inkl. Spenden und Zuschüsse", placeholder: "Gesamtumsatz in einem Jahr", icon: faMoneyBillTrendUp },
];

const costFields: FieldConfig[] = [
  { name: "personnel_costs", label: "Personalkosten", placeholder: "Gesamte Personalkosten", icon: faUserTie },
  { name: "material_goods_costs", label: "Material / Wareneinkauf inkl. Hygiene", placeholder: "Kosten für Material und Wareneinkauf", icon: faUtensils },
  { name: "energy_costs", label: "Energiekosten", placeholder: "Gesamtenergiekosten", icon: faBolt },
  { name: "outsourced_services_costs", label: "Einsatz von Fremdfirmen", placeholder: "Kosten für externe Dienstleister", icon: faBroom, optional: true },
  { name: "other_operating_costs", label: "Sonstige Sachkosten (Werbung, Auto, ...)", placeholder: "Sonstige Betriebskosten", icon: faWrench },
];

// V2 / Netzwerk-2 cost fields — shown only for cat.1 + cat.2.
const v2CostFields: FieldConfig[] = [
  { name: "repair_maintenance_costs", label: "Reparaturkosten / Instandhaltung", placeholder: "Optional", icon: faWrench, optional: true },
  { name: "depreciation_costs", label: "Abschreibungen", placeholder: "Optional", icon: faMoneyBillTrendUp, optional: true },
  { name: "rent_lease_costs", label: "Pacht / Miete", placeholder: "Optional", icon: faHotel, optional: true },
];

// V2 / Netzwerk-2 group & event fields — shown only for cat.1 + cat.2.
const groupEventFields: FieldConfig[] = [
  { name: "total_groups", label: "Anzahl Gruppen / Seminare", placeholder: "Optional", icon: faUsers, optional: true },
  { name: "own_groups", label: "Anzahl eigene Gruppen / Seminare", placeholder: "Optional", icon: faUsers, optional: true },
  { name: "own_participants", label: "Anzahl eigene Teilnehmer", placeholder: "Optional", icon: faUsers, optional: true },
  { name: "returning_groups", label: "Anzahl Stammgruppen", placeholder: "Optional", icon: faUsers, optional: true },
];

// V2 / Netzwerk-2 per-area personnel block (5 areas x {Jahresstunden, Lohnkosten}) — cat.1 + cat.2.
const personnelFields: FieldConfig[] = [
  { name: "pers_admin_hours", label: "Verwaltung – Jahresstunden", placeholder: "Optional", icon: faCalendarWeek, optional: true },
  { name: "pers_admin_wage", label: "Verwaltung – Lohnkosten", placeholder: "Optional", icon: faUserTie, optional: true },
  { name: "pers_kitchen_hours", label: "Hauswirtschaft-Küche – Jahresstunden", placeholder: "Optional", icon: faCalendarWeek, optional: true },
  { name: "pers_kitchen_wage", label: "Hauswirtschaft-Küche – Lohnkosten", placeholder: "Optional", icon: faUserTie, optional: true },
  { name: "pers_cleaning_hours", label: "Hauswirtschaft-Reinigung – Jahresstunden", placeholder: "Optional", icon: faCalendarWeek, optional: true },
  { name: "pers_cleaning_wage", label: "Hauswirtschaft-Reinigung – Lohnkosten", placeholder: "Optional", icon: faUserTie, optional: true },
  { name: "pers_tech_hours", label: "Technik – Jahresstunden", placeholder: "Optional", icon: faCalendarWeek, optional: true },
  { name: "pers_tech_wage", label: "Technik – Lohnkosten", placeholder: "Optional", icon: faUserTie, optional: true },
  { name: "pers_edu_hours", label: "Pädagogik – Jahresstunden", placeholder: "Optional", icon: faCalendarWeek, optional: true },
  { name: "pers_edu_wage", label: "Pädagogik – Lohnkosten", placeholder: "Optional", icon: faUserTie, optional: true },
];

const incomeFields: FieldConfig[] = [
  { name: "donations_subsidies_income", label: "Einnahmen aus Spenden und Zuschüsse", placeholder: "Optional", icon: faHandHoldingHeart, optional: true },
  { name: "other_income", label: "Sonstige Einnahmen", placeholder: "Optional", icon: faMicrophone, optional: true },
  { name: "catering_income", label: "Verpflegung", placeholder: "Optional", icon: faCutlery, optional: true },
  { name: "accommodation_income", label: "Einkünfte aus Beherbergung", placeholder: "Optional", icon: faHotel, optional: true },
];

function Panel({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`w-full flex items-center gap-3 px-6 py-4 text-left bg-gradient-to-r from-brand-50 to-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset transition-colors ${open ? 'border-b border-slate-200' : ''}`}
      >
        <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={icon} className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div
          className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          <FontAwesomeIcon icon={faChevronDown} className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
          </div>
        </div>
      </div>
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
  submitting,
  categoryName
}: {
  id: string;
  form: FacilityDetailFormData;
  setFormAction: Dispatch<SetStateAction<FacilityDetailFormData>>,
  setErrorsAction: Dispatch<SetStateAction<Record<string, string>>>,
  errors: Record<string, string>;
  onSubmitAction: (e: React.FormEvent) => void;
  submitting: boolean;
  categoryName?: string;
}) {
  const showV2Fields = isV2Eligible(categoryName);
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

      <form onSubmit={onSubmitAction} noValidate className="space-y-6">

        <Panel icon={faBed} title="Core Metrics" subtitle="Key operational figures for the year">
          {coreFields.map(renderField)}
        </Panel>

        <Panel icon={faHandHoldingHeart} title="Additional Income Sources" subtitle="Optional — fill in if applicable">
          {incomeFields.map(renderField)}
        </Panel>

        <Panel icon={faMoneyBillTrendUp} title="Operating Costs" subtitle="Annual expenditure breakdown">
          {costFields.map(renderField)}
        </Panel>

        {showV2Fields && (
          <>
            <Panel icon={faUserTie} title="Personalkosten je Bereich" subtitle="Optional — Jahresstunden und Lohnkosten je Bereich">
              {personnelFields.map(renderField)}
            </Panel>

            <Panel icon={faWrench} title="Weitere Kosten" subtitle="Optional — nur für Hotels und Tagungshäuser">
              {v2CostFields.map(renderField)}
            </Panel>

            <Panel icon={faUsers} title="Gruppen & Veranstaltungen" subtitle="Optional — nur für Hotels und Tagungshäuser">
              {groupEventFields.map(renderField)}
            </Panel>
          </>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
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
        </div>
      </form>
    </>
  );
}
