"use client";

import { Federation } from "@/lib/types/facilities";
import {
  faTag, faArrowRight, faBuilding, faUser, faArrowLeft, faChartBar,
  faSpinner, faExclamationCircle, faExclamationTriangle,
  faCircleInfo
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { internalBenchmarkPreparation, submitInternalBenchmark } from "./actions";
import { InternalBenchmark, InternalBenchmarkResponse } from "@/lib/types/benchmark";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  RadialLinearScale, Filler, Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Line, Radar } from "react-chartjs-2";
import BenchmarkStats from "./benchmark-stats";
import BenchmarkRanking from "./benchmark-ranking";
import FacilityComparison from "./facility-comparision";
import BenchmarkInsights from "./benchmark-insights";
import ExportBenchmark from "./export-benchmark";
import SearchableSelect from "@/components/searchable-select";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  RadialLinearScale, Filler, Title, Tooltip, Legend
);

function getFacilityColor(index: number, total: number) {
  const hue = (index * (360 / Math.max(total, 1)) + index * 37) % 360;
  return {
    bg: `hsla(${hue}, 70%, 55%, 0.75)`,
    border: `hsla(${hue}, 70%, 45%, 1)`,
    fill: `hsla(${hue}, 70%, 55%, 0.15)`,
  };
}

const SECTIONS = [
  { key: "occupancy_utilization", label: "Belegung & Nutzung", accent: "brand", chart: "radar" },
  { key: "revenue_kpis", label: "Erlöskennzahlen", accent: "orange", chart: "bar" },
  { key: "cost_efficiency_kpis", label: "Kosten & Effizienzkennzahlen", accent: "teal", chart: "hbar" },
  { key: "category_specific_kpis", label: "Kategorie-spezifische Kennzahlen", accent: "purple", chart: "line" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];
type ChartType = typeof SECTIONS[number]["chart"];
type FeatureTab = "charts" | "stats" | "ranking" | "comparison" | "insights";

const FEATURE_TABS: { key: FeatureTab; icon: string; label: string }[] = [
  { key: "charts", icon: "📊", label: "Diagramme" },
  { key: "stats", icon: "🔢", label: "Statistiken" },
  { key: "ranking", icon: "🏆", label: "Ranking" },
  { key: "comparison", icon: "🔍", label: "Vergleich" },
  { key: "insights", icon: "💡", label: "Einblicke" },
];

const ACCENT_STYLES: Record<string, { tab: string; dot: string; header: string }> = {
  brand: { tab: "bg-brand-600 text-white shadow", dot: "bg-brand-500", header: "from-brand-50 to-white border-brand-100" },
  orange: { tab: "bg-orange-500 text-white shadow", dot: "bg-orange-400", header: "from-orange-50 to-white border-orange-100" },
  teal: { tab: "bg-teal-600 text-white shadow", dot: "bg-teal-500", header: "from-teal-50 to-white border-teal-100" },
  purple: { tab: "bg-purple-600 text-white shadow", dot: "bg-purple-500", header: "from-purple-50 to-white border-purple-100" },
};

const TOOLTIP_DEFAULTS = {
  backgroundColor: "rgba(15,23,42,0.9)",
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 13, weight: "bold" as const },
  bodyFont: { size: 12 },
};

const LEGEND_DEFAULTS = {
  position: "top" as const,
  labels: {
    font: { size: 12, weight: 600 as const },
    padding: 12,
    usePointStyle: true,
    pointStyle: "circle" as const,
  },
};

import { TooltipItem } from "chart.js";

function fmtValue(n: number, unit?: string): string {
  const base = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return unit ? `${base} ${unit}` : base;
}

function makeTooltip<T extends "bar" | "line" | "radar">(section: InternalBenchmark[SectionKey]) {
  return {
    ...TOOLTIP_DEFAULTS,
    callbacks: {
      label: (tooltipItem: TooltipItem<T>) => {
        const idx = tooltipItem.dataIndex;
        const unit = section.labels[idx]?.unit ?? "";
        const formatted = fmtValue(tooltipItem.raw as number, unit);
        const dsLabel = (tooltipItem.dataset as { label?: string }).label ?? "";
        return `${dsLabel}: ${formatted}`;
      },
      footer: (tooltipItems: TooltipItem<T>[]) => {
        const idx = tooltipItems[0]?.dataIndex;
        const help = section.labels[idx]?.help_text;
        return help ? `ℹ️ ${help}` : "";
      },
    },
    footerFont: { size: 11, style: "italic" as const },
    footerColor: "rgba(200,220,255,0.9)",
    footerMarginTop: 6,
  };
}

function SectionChart({
  section,
  chartType,
}: {
  section: InternalBenchmark[SectionKey];
  chartType: ChartType;
}) {
  const total = section.data.length;
  const colors = section.data.map((_, i) => getFacilityColor(i, total));

  // Extract plain strings for chart labels
  const chartLabels = section.labels.map(l => l.label);

  if (chartType === "radar") {
    return (
      <Radar
        data={{
          labels: chartLabels,
          datasets: section.data.map((f, i) => ({
            label: f.name,
            data: f.data,
            backgroundColor: colors[i].fill,
            borderColor: colors[i].border,
            borderWidth: 2,
            pointBackgroundColor: colors[i].border,
            pointRadius: 4,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: LEGEND_DEFAULTS, tooltip: makeTooltip<"radar">(section) },
          scales: {
            r: {
              beginAtZero: true,
              ticks: { font: { size: 10 }, maxTicksLimit: 5, backdropColor: "transparent" },
              pointLabels: { font: { size: 11 } },
              grid: { color: "rgba(0,0,0,0.07)" },
              angleLines: { color: "rgba(0,0,0,0.07)" },
            },
          },
        }}
      />
    );
  }

  if (chartType === "line") {
    return (
      <Line
        data={{
          labels: chartLabels,
          datasets: section.data.map((f, i) => ({
            label: f.name,
            data: f.data,
            backgroundColor: colors[i].fill,
            borderColor: colors[i].border,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors[i].border,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: LEGEND_DEFAULTS, tooltip: makeTooltip<"line">(section) },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 }, maxTicksLimit: 6 } },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 30 } },
          },
        }}
      />
    );
  }

  const isHorizontal = chartType === "hbar";
  return (
    <Bar
      data={{
        labels: chartLabels,
        datasets: section.data.map((f, i) => ({
          label: f.name,
          data: f.data,
          backgroundColor: colors[i].bg,
          borderColor: colors[i].border,
          borderWidth: 2,
          borderRadius: 5,
        })),
      }}
      options={{
        indexAxis: (isHorizontal ? "y" : "x") as "x" | "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: LEGEND_DEFAULTS, tooltip: makeTooltip<"bar">(section) },
        scales: {
          [isHorizontal ? "x" : "y"]: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 }, maxTicksLimit: 6 } },
          [isHorizontal ? "y" : "x"]: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: isHorizontal ? 0 : 30 } },
        },
      }}
    />
  );
}

function EmptyFederations() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faBuilding} className="w-9 h-9 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Keine Verbände gefunden</p>
        <p className="text-sm text-slate-500 mt-1">Bitten Sie den Administrator, Ihre Föderation zu genehmigen.</p>
      </div>
    </div>
  );
}

function EmptyBenchmark({ name }: { name: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faChartBar} className="w-10 h-10 text-brand-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Bereit zum Benchmarking?</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Wählen Sie oben ein Jahr aus und erstellen Sie einen Vergleichswert, um zu sehen, wie die Einrichtungen unter{" "}
          <span className="font-semibold text-slate-700">{name}</span> funktionieren.
        </p>
      </div>
    </div>
  );
}

// ─── BenchmarkResult now also receives year + federationName for exports ───────
function BenchmarkResult({
  benchmark,
  year,
  federationName,
}: {
  benchmark: InternalBenchmark;
  year: number;
  federationName: string;
}) {
  const [featureTab, setFeatureTab] = useState<FeatureTab>("charts");
  const [activeSection, setActiveSection] = useState<SectionKey>("occupancy_utilization");

  const meta = SECTIONS.find(s => s.key === activeSection)!;
  const section = benchmark[activeSection];
  const styles = ACCENT_STYLES[meta.accent];
  const total = section.data.length;

  const chartHeight = meta.chart === "hbar"
    ? Math.max(320, section.labels.length * total * 28 + 80)
    : 380;

  return (
    <div className="space-y-4">
      {/* ── Feature tabs + Export buttons in one row ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {FEATURE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFeatureTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${featureTab === t.key
                  ? "bg-slate-800 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Export buttons — right-aligned, non-intrusive */}
        <ExportBenchmark
          benchmark={benchmark}
          year={year}
          federationName={federationName}
        />
      </div>

      {featureTab === "charts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => {
              const isActive = s.key === activeSection;
              const a = ACCENT_STYLES[s.accent];
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isActive ? a.tab : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                    }`}
                >
                  {!isActive && <span className={`w-2 h-2 rounded-full ${a.dot}`} />}
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className={`px-5 py-4 border-b bg-gradient-to-r ${styles.header}`}>
              <h3 className="text-base font-bold text-slate-800">{meta.label}</h3>
              <p className="text-xs mt-0.5 text-slate-500">
                {total} {total === 1 ? "facility" : "facilities"} · {section.labels.length} KPIs
              </p>
            </div>
            <div className="p-5" style={{ height: chartHeight }}>
              <SectionChart section={section} chartType={meta.chart} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-700">Rohwerte</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">KPI</th>
                    {section.data.map((f, i) => (
                      <th
                        key={f.name}
                        className="px-5 py-3 font-semibold whitespace-nowrap"
                        style={{ color: getFacilityColor(i, total).border }}
                      >
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.labels.map((item, li) => (
                    <tr key={item.label} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap" title={item.help_text}>
                        <span className="flex flex-col gap-1">
                          {item.label}
                          <span className="flex gap-1.5 text-slate-500">
                            <FontAwesomeIcon
                              icon={faCircleInfo}
                              className="w-2 h-2 text-slate-400 cursor-help"
                            />
                            <small>{item.help_text}</small>
                          </span>
                        </span>
                      </td>
                      {section.data.map(f => (
                        <td key={f.name} className="px-5 py-3 text-slate-600 tabular-nums whitespace-nowrap">
                          {fmtValue(f.data[li], item.unit)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {featureTab === "stats" && <BenchmarkStats benchmark={benchmark} />}
      {featureTab === "ranking" && <BenchmarkRanking benchmark={benchmark} />}
      {featureTab === "comparison" && <FacilityComparison benchmark={benchmark} />}
      {featureTab === "insights" && <BenchmarkInsights benchmark={benchmark} />}
    </div>
  );
}

function SelectedFederation({ federation }: { federation: Federation }) {
  const [years, setYears] = useState<number[]>([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [benchmark, setBenchmark] = useState<InternalBenchmark | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingYears(true);
      const { results } = await internalBenchmarkPreparation(federation.id);
      setYears(results);
      setLoadingYears(false);
    }
    load();
  }, [federation]);

  async function handleSubmit() {
    setFormError(null);
    setFieldError(null);

    if (!selectedYear) {
      setFieldError("Bitte wählen Sie ein Jahr.");
      return;
    }

    setSubmitting(true);
    try {
      const res: InternalBenchmarkResponse = await submitInternalBenchmark(federation.id, Number(selectedYear));

      if (res.status === "success") {
        setBenchmark(res.results);
      } else if (res.type === "validation") {
        setFieldError(res.errors.year?.[0] ?? res.errors.federation?.[0] ?? "Validierungsfehler.");
      } else {
        setFormError(res.message);
      }
    } catch {
      setFormError("Benchmark-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-brand-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brand-50 to-brand-50 border-b border-brand-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-brand-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800 truncate">{federation.name}</h2>
              {federation.user_name && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-medium text-slate-600">{federation.user_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50/60 p-5">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {loadingYears ? (
                  <div className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-400 text-sm">
                    Jahre werden geladen…
                  </div>
                ) : (
                  <SearchableSelect
                    name="year"
                    value={selectedYear}
                    placeholder="Jahr auswählen…"
                    options={years.map(year => ({ label: String(year), value: String(year) }))}
                    error={!!fieldError}
                    onChange={(_name, value) => { setSelectedYear(value); setFieldError(null); }}
                  />
                )}
                {fieldError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                    <FontAwesomeIcon icon={faExclamationCircle} className="w-3 h-3" />
                    {fieldError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || loadingYears}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                  bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800
                  disabled:bg-brand-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow cursor-pointer"
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faChartBar} className="w-4 h-4" />
                    <span>Benchmark Generieren</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {formError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Not Found</p>
            <p className="text-sm text-amber-700 mt-0.5">{formError}</p>
          </div>
          <button
            onClick={() => setFormError(null)}
            className="ml-auto text-amber-400 hover:text-amber-600 transition-colors text-lg leading-none"
          >×</button>
        </div>
      )}

      {benchmark
        ? <BenchmarkResult
            benchmark={benchmark}
            year={Number(selectedYear)}
            federationName={federation.name}
          />
        : <EmptyBenchmark name={federation.name} />
      }
    </>
  );
}

export default function FederationCard({ federations }: { federations: Federation[] }) {
  const [federation, setFederation] = useState<Federation | null>(null);

  if (federations.length === 0) return <EmptyFederations />;

  if (federation) return (
    <>
      <button
        onClick={() => setFederation(null)}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer mb-4"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
        Zurück zur Auswahl
      </button>
      <SelectedFederation federation={federation} />
    </>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {federations.map(item => (
        <div key={item.id} className="space-y-4 group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors flex-1 min-w-0">
                {item.name}
              </h3>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
              <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
              <span className="text-xs font-medium">{item.category_name}</span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setFederation(item)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                border border-brand-600 text-brand-600 text-sm font-semibold hover:bg-brand-700 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              Wählen
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
