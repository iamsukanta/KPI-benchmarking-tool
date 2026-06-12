"use client";

import { useState, useEffect, useRef } from "react";
import { retrieveFacility } from "@/lib/api/facilities";
import { Facility } from "@/lib/types/facilities";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faExclamationCircle,
  faPlus,
  faCalendar,
  faBed,
  faDollarSign,
  faChartLine,
  faPenToSquare,
  faArrowTrendUp,
  faArrowTrendDown,
  faLock,
  faUsers,
  faDoorOpen,
  faHandHoldingHeart,
  faMicrophone,
  faUtensils,
  faHotel,
  faUserTie,
  faBolt,
  faBroom,
  faWrench,
  faMinus,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { FacilityDetail } from "@/lib/types/facilities";

function safeInt(value?: string): number {
  const n = parseInt(value ?? '');
  return isNaN(n) ? 0 : n;
}

function calculateTrend(current: string, previous?: string): number | null {
  const prev = safeInt(previous);
  if (!previous || prev === 0) return null;
  return ((safeInt(current) - prev) / prev) * 100;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(safeInt(value));
}

function formatNumber(value: string) {
  return new Intl.NumberFormat('de-DE').format(safeInt(value));
}

function CollapsePanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      const h = ref.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(ref.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ height: height !== undefined ? `${height}px` : 'auto' }}
      className="overflow-hidden transition-[height] duration-300 ease-in-out"
    >
      {children}
    </div>
  );
}

type TrendBadgeProps = {
  trend: number | null;
  inverse?: boolean;
};

function TrendBadge({ trend, inverse = false }: TrendBadgeProps) {
  if (trend === null) return null;
  const isNeutral = trend === 0;
  const isPositive = inverse ? trend <= 0 : trend >= 0;

  return (
    <div
      className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full ${isNeutral
          ? 'text-slate-500 bg-slate-100'
          : isPositive
            ? 'text-green-700 bg-green-100'
            : 'text-red-700 bg-red-100'
        }`}
    >
      <FontAwesomeIcon
        icon={isNeutral ? faMinus : trend > 0 ? faArrowTrendUp : faArrowTrendDown}
        className="w-3 h-3"
      />
      <span>{Math.abs(trend).toFixed(1)}%</span>
    </div>
  );
}

type StatCardProps = {
  icon: any;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  borderColor: string;
  label: string;
  labelColor: string;
  value: string;
  trend: number | null;
  inverse?: boolean;
  formatter?: (v: string) => string;
};

function StatCard({
  icon, iconBg, iconColor, cardBg, borderColor,
  label, labelColor, value, trend, inverse = false,
  formatter = formatNumber,
}: StatCardProps) {
  return (
    <div className={`${cardBg} p-4 rounded-xl border ${borderColor} flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${iconColor}`} />
        </div>
        <TrendBadge trend={trend} inverse={inverse} />
      </div>
      <div>
        <p className={`text-xs font-semibold ${labelColor} mb-0.5`}>{label}</p>
        <p className="text-lg font-bold text-slate-800 leading-tight">{formatter(value)}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {children}
      </div>
    </div>
  );
}

export default function FacilityDetailTable({ id }: { id: string }) {
  const { user } = useAuth();
  const [facility, setFacility] = useState<Facility>();
  const [error, setError] = useState<string>();
  const [notFoundError, setNotFoundError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const { results, message } = await retrieveFacility(id);
        if (message) {
          setNotFoundError(message);
        } else {
          setFacility(results);
          if (results?.details?.length) {
            setOpenCards({ [results.details[0].id]: true });
          }
        }
      } catch {
        setError("Failed to load facility details.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  function toggleCard(detailId: string) {
    setOpenCards(prev => ({ ...prev, [detailId]: !prev[detailId] }));
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

      {notFoundError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Fehler</h3>
            <p className="text-sm text-red-600 mt-1">{notFoundError}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Jährliche Daten</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {facility?.name}
                {user?.role === 'federation_manager' && (
                  <span>
                    {' – '}
                    <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
                    Nur Leserechte – Diese Daten können nur von der Hausleitung bearbeitet werden
                  </span>
                )}
              </p>
            </div>
          </div>

          {user?.role === 'facility_manager' && (
            <Link
              href={`/facilities/${id}/detail/create`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 transition-all duration-150 shadow-sm hover:shadow"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Jährliche Daten hinzufügen</span>
            </Link>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-500">Jahresdaten werden geladen...</p>
        </div>
      ) : facility?.details?.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="w-9 h-9 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">Keine Details gefunden</p>
            <p className="text-sm text-slate-500 mt-1">Beginnen Sie, indem Sie Ihr erstes Detail hinzufügen</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-brand-200 hidden md:block" />

          <div className="space-y-4">
            {facility?.details?.map((detail: FacilityDetail, index: number) => {
              const prev = facility?.details?.[index + 1] as FacilityDetail | undefined;
              const isOpen = !!openCards[detail.id];

              const trends = {
                overnight_stays: calculateTrend(detail.overnight_stays, prev?.overnight_stays),
                guests: calculateTrend(detail.guests, prev?.guests),
                rooms_sold: calculateTrend(detail.rooms_sold, prev?.rooms_sold),
                total_revenue: calculateTrend(detail.total_revenue, prev?.total_revenue),
                total_costs: calculateTrend(detail.total_costs, prev?.total_costs),
                donations_subsidies_income: calculateTrend(detail.donations_subsidies_income, prev?.donations_subsidies_income),
                other_income: calculateTrend(detail.other_income, prev?.other_income),
                catering_income: calculateTrend(detail.catering_income, prev?.catering_income),
                accommodation_income: calculateTrend(detail.accommodation_income, prev?.accommodation_income),
                personnel_costs: calculateTrend(detail.personnel_costs, prev?.personnel_costs),
                material_goods_costs: calculateTrend(detail.material_goods_costs, prev?.material_goods_costs),
                energy_costs: calculateTrend(detail.energy_costs, prev?.energy_costs),
                outsourced_services_costs: calculateTrend(detail.outsourced_services_costs, prev?.outsourced_services_costs),
                other_operating_costs: calculateTrend(detail.other_operating_costs, prev?.other_operating_costs),
              };

              return (
                <div key={detail.id} className="relative">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 border-4 border-white shadow-md hidden md:block z-10 top-6" />

                  <div className="md:ml-20 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCard(detail.id)}
                      className="w-full text-left px-6 py-4 bg-gradient-to-r from-brand-50 to-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-brand-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">{detail.year}</h3>
                            {!detail.is_published && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                                Entwurf
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {user?.role === 'facility_manager' && (
                            <Link
                              href={`/facilities/${facility!.id}/detail/${detail.id}`}
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                              <span>Bearbeiten</span>
                            </Link>
                          )}

                          <div
                            className={`cursor-pointer w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                              }`}
                          >
                            <FontAwesomeIcon icon={faChevronDown} className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                      </div>
                    </button>

                    <CollapsePanel open={isOpen}>
                      <div className="border-t border-slate-200 p-6 space-y-6">
                        <Section title="Betriebskennzahlen">
                          <StatCard
                            icon={faBed} iconBg="bg-cyan-100" iconColor="text-cyan-600"
                            cardBg="bg-cyan-50/50" borderColor="border-cyan-100"
                            label="Anzahl Übernachtungen" labelColor="text-cyan-700"
                            value={detail.overnight_stays} trend={trends.overnight_stays}
                          />
                          <StatCard
                            icon={faUsers} iconBg="bg-violet-100" iconColor="text-violet-600"
                            cardBg="bg-violet-50/50" borderColor="border-violet-100"
                            label="Anzahl Anreisen" labelColor="text-violet-700"
                            value={detail.guests} trend={trends.guests}
                          />
                          <StatCard
                            icon={faDoorOpen} iconBg="bg-sky-100" iconColor="text-sky-600"
                            cardBg="bg-sky-50/50" borderColor="border-sky-100"
                            label="Zimmer verkauft" labelColor="text-sky-700"
                            value={detail.rooms_sold} trend={trends.rooms_sold}
                          />
                        </Section>

                        <Section title="Finanzielle Zusammenfassung">
                          <StatCard
                            icon={faChartLine} iconBg="bg-green-100" iconColor="text-green-600"
                            cardBg="bg-green-50/50" borderColor="border-green-100"
                            label="Gesamtumsatz" labelColor="text-green-700"
                            value={detail.total_revenue} trend={trends.total_revenue}
                            formatter={formatCurrency}
                          />
                          <StatCard
                            icon={faDollarSign} iconBg="bg-red-100" iconColor="text-red-600"
                            cardBg="bg-red-50/50" borderColor="border-red-100"
                            label="Gesamtkosten" labelColor="text-red-700"
                            value={detail.total_costs} trend={trends.total_costs}
                            formatter={formatCurrency} inverse
                          />
                        </Section>

                        <Section title="Einkommensaufschlüsselung">
                          <StatCard
                            icon={faHandHoldingHeart} iconBg="bg-pink-100" iconColor="text-pink-600"
                            cardBg="bg-pink-50/50" borderColor="border-pink-100"
                            label="Spenden & Zuschüsse" labelColor="text-pink-700"
                            value={detail.donations_subsidies_income} trend={trends.donations_subsidies_income}
                            formatter={formatCurrency}
                          />
                          <StatCard
                            icon={faMicrophone} iconBg="bg-brand-100" iconColor="text-brand-600"
                            cardBg="bg-brand-50/50" borderColor="border-brand-100"
                            label="Sonstige Einnahmen" labelColor="text-brand-700"
                            value={detail.other_income} trend={trends.other_income}
                            formatter={formatCurrency}
                          />
                          <StatCard
                            icon={faUtensils} iconBg="bg-orange-100" iconColor="text-orange-600"
                            cardBg="bg-orange-50/50" borderColor="border-orange-100"
                            label="Verpflegung" labelColor="text-orange-700"
                            value={detail.catering_income} trend={trends.catering_income}
                            formatter={formatCurrency}
                          />
                          <StatCard
                            icon={faHotel} iconBg="bg-teal-100" iconColor="text-teal-600"
                            cardBg="bg-teal-50/50" borderColor="border-teal-100"
                            label="Unterkunft" labelColor="text-teal-700"
                            value={detail.accommodation_income} trend={trends.accommodation_income}
                            formatter={formatCurrency}
                          />
                        </Section>

                        <Section title="Kostenaufschlüsselung">
                          <StatCard
                            icon={faUserTie} iconBg="bg-rose-100" iconColor="text-rose-600"
                            cardBg="bg-rose-50/50" borderColor="border-rose-100"
                            label="Personal" labelColor="text-rose-700"
                            value={detail.personnel_costs} trend={trends.personnel_costs}
                            formatter={formatCurrency} inverse
                          />
                          <StatCard
                            icon={faUtensils} iconBg="bg-amber-100" iconColor="text-amber-600"
                            cardBg="bg-amber-50/50" borderColor="border-amber-100"
                            label="Material / Wareneinkauf" labelColor="text-amber-700"
                            value={detail.material_goods_costs} trend={trends.material_goods_costs}
                            formatter={formatCurrency} inverse
                          />
                          <StatCard
                            icon={faBolt} iconBg="bg-yellow-100" iconColor="text-yellow-600"
                            cardBg="bg-yellow-50/50" borderColor="border-yellow-100"
                            label="Energie" labelColor="text-yellow-700"
                            value={detail.energy_costs} trend={trends.energy_costs}
                            formatter={formatCurrency} inverse
                          />
                          <StatCard
                            icon={faBroom} iconBg="bg-lime-100" iconColor="text-lime-600"
                            cardBg="bg-lime-50/50" borderColor="border-lime-100"
                            label="Fremdfirmen" labelColor="text-lime-700"
                            value={detail.outsourced_services_costs} trend={trends.outsourced_services_costs}
                            formatter={formatCurrency} inverse
                          />
                          <StatCard
                            icon={faWrench} iconBg="bg-slate-100" iconColor="text-slate-600"
                            cardBg="bg-slate-50/50" borderColor="border-slate-200"
                            label="Sonstige Sachkosten" labelColor="text-slate-600"
                            value={detail.other_operating_costs} trend={trends.other_operating_costs}
                            formatter={formatCurrency} inverse
                          />
                        </Section>
                      </div>
                    </CollapsePanel>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
