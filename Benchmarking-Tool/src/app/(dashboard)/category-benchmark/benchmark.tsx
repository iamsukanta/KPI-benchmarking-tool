"use client";

import React, { useState } from "react";
import { Bar, Radar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faEuroSign,
  faGears,
  faStar,
  faArrowUp,
  faArrowDown,
  faMinus,
  faFilePdf,
  faFileExcel,
  faSpinner,
  faCircleInfo,
  faUsers,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { CategoryWideBenchmark } from "@/lib/types/benchmark";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// ─── Types ────────────────────────────────────────────────────────────────────

type AggregationType = "median" | "average" | "min" | "max";
type ChartType = "bar" | "bar-horizontal" | "line" | "radar";
type ExportState = "idle" | "loading";

/** Each label entry from the API */
interface LabelEntry {
  label: string;
  help_text: string;
  unit?: string;
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const COLOR_MAP = {
  brand: {
    border: "border-brand-200",
    header: "from-brand-50",
    icon: "bg-brand-100 text-brand-600",
    my: { fill: "rgba(99,102,241,0.75)", stroke: "rgba(99,102,241,1)" },
    cat: { fill: "rgba(168,85,247,0.55)", stroke: "rgba(168,85,247,1)" },
  },
  emerald: {
    border: "border-emerald-200",
    header: "from-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    my: { fill: "rgba(16,185,129,0.75)", stroke: "rgba(16,185,129,1)" },
    cat: { fill: "rgba(245,158,11,0.55)", stroke: "rgba(245,158,11,1)" },
  },
  amber: {
    border: "border-amber-200",
    header: "from-amber-50",
    icon: "bg-amber-100 text-amber-600",
    my: { fill: "rgba(245,158,11,0.65)", stroke: "rgba(245,158,11,1)" },
    cat: { fill: "rgba(239,68,68,0.45)", stroke: "rgba(239,68,68,1)" },
  },
  purple: {
    border: "border-purple-200",
    header: "from-purple-50",
    icon: "bg-purple-100 text-purple-600",
    my: { fill: "rgba(168,85,247,0.75)", stroke: "rgba(168,85,247,1)" },
    cat: { fill: "rgba(236,72,153,0.55)", stroke: "rgba(236,72,153,1)" },
  },
} as const;

// ─── KPI section config ───────────────────────────────────────────────────────

const KPI_SECTIONS: {
  key: keyof CategoryWideBenchmark["median"];
  label: string;
  icon: typeof faBed;
  color: keyof typeof COLOR_MAP;
  chartType: ChartType;
}[] = [
  {
    key: "occupancy_utilization",
    label: "Belegung & Nutzung",
    icon: faBed,
    color: "brand",
    chartType: "bar",
  },
  {
    key: "revenue_kpis",
    label: "Erlöskennzahlen",
    icon: faEuroSign,
    color: "emerald",
    chartType: "line",
  },
  {
    key: "cost_efficiency_kpis",
    label: "Kosten & Effizienzkennzahlen",
    icon: faGears,
    color: "amber",
    chartType: "radar",
  },
  {
    key: "category_specific_kpis",
    label: "Kategorie-spezifische Kennzahlen",
    icon: faStar,
    color: "purple",
    chartType: "bar-horizontal",
  },
  {
    key: "group_event_kpis",
    label: "Gruppen & Veranstaltungen",
    icon: faUsers,
    color: "brand",
    chartType: "bar",
  },
  {
    key: "personnel_area_kpis",
    label: "Personalkosten je Bereich",
    icon: faUserTie,
    color: "emerald",
    chartType: "bar-horizontal",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(value: number): string {
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(2) + "k";
  if (!Number.isInteger(value) && value !== 0) return value.toFixed(2);
  return value.toLocaleString();
}

function formatWithUnit(value: number, unit?: string): string {
  const base = formatValue(value);
  return unit ? `${base} ${unit}` : base;
}

/** Render a KPI value, showing "nicht berechenbar" for NULL (R001). */
function formatCellValue(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return "nicht berechenbar";
  return formatWithUnit(value, unit);
}

/** Normalise a labels array: accept both raw strings (legacy) and LabelEntry objects */
function normaliseLabelEntry(entry: unknown): LabelEntry {
  if (typeof entry === "string") return { label: entry, help_text: "", unit: "" };
  if (
    entry &&
    typeof entry === "object" &&
    "label" in entry &&
    typeof (entry as LabelEntry).label === "string"
  ) {
    return entry as LabelEntry;
  }
  return { label: String(entry), help_text: "", unit: "" };
}

function wrapText(text: string, maxLen = 46): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLen) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  // Prefix the first line with the info circle symbol
  if (lines.length > 0) lines[0] = `ℹ️  ${lines[0]}`;
  return lines;
}

// ─── DeltaBadge ───────────────────────────────────────────────────────────────

function DeltaBadge({
  my,
  cat,
  reverse = false,
}: {
  my: number | null;
  cat: number | null;
  reverse?: boolean;
}) {
  if (my === null || cat === null || cat === 0)
    return <span className="text-xs text-slate-400">—</span>;
  const pct = ((my - cat) / cat) * 100;
  const neutral = Math.abs(pct) < 0.5;
  if (neutral)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
        <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
        Gleichstand
      </span>
    );
  const up = pct > 0;

  if (reverse) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          up ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="w-2.5 h-2.5" />
        {Math.abs(pct).toFixed(1)}%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="w-2.5 h-2.5" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// ─── Chart renderer ───────────────────────────────────────────────────────────

const legendConfig = {
  position: "top" as const,
  labels: {
    font: { size: 12, weight: 600 as const },
    usePointStyle: true,
    pointStyle: "circle" as const,
    padding: 14,
  },
};

const tooltipBase = {
  backgroundColor: "rgba(15,23,42,0.92)",
  padding: 12,
  cornerRadius: 8,
  titleFont: { size: 13, weight: "bold" as const },
  bodyFont: { size: 12 },
  footerFont: { size: 11, style: "italic" as const },
  // slate-400 equivalent
  footerColor: "rgba(148,163,184,1)",
  footerMarginTop: 8,
  // thin horizontal rule effect via footer prefix
  multiKeyBackground: "transparent",
};

/**
 * Build a Chart.js tooltip config whose label shows the unit and footer shows
 * the help_text for whichever label is hovered. Works for bar/line charts.
 */
function buildLabelKeyedTooltip(labelEntries: LabelEntry[]) {
  const helpMap = Object.fromEntries(
    labelEntries.map((e) => [e.label, e.help_text])
  );
  const unitMap = Object.fromEntries(
    labelEntries.map((e) => [e.label, e.unit ?? ""])
  );
  return {
    ...tooltipBase,
    callbacks: {
      label(item: { label: string; dataset: { label?: string }; raw: unknown }) {
        const unit = unitMap[item.label] ?? "";
        const formatted = formatWithUnit(Number(item.raw), unit);
        return `${item.dataset.label ?? ""}: ${formatted}`;
      },
      footer(items: { label: string }[]) {
        const help = items[0] ? helpMap[items[0].label] ?? "" : "";
        return wrapText(help);
      },
    },
  };
}

/**
 * Build a Chart.js tooltip config whose label shows the unit and footer shows
 * the help_text by data index. Used for radar charts.
 */
function buildIndexKeyedTooltip(labelEntries: LabelEntry[]) {
  return {
    ...tooltipBase,
    callbacks: {
      label(item: { dataIndex: number; dataset: { label?: string }; raw: unknown }) {
        const entry = labelEntries[item.dataIndex];
        const unit = entry?.unit ?? "";
        const formatted = formatWithUnit(Number(item.raw), unit);
        return `${item.dataset.label ?? ""}: ${formatted}`;
      },
      footer(items: { dataIndex: number }[]) {
        const help = items[0] ? labelEntries[items[0].dataIndex]?.help_text ?? "" : "";
        return wrapText(help);
      },
    },
  };
}

function SectionChart({
  chartType,
  labelEntries,
  myData,
  catData,
  facilityName,
  catLabel,
  colors,
}: {
  chartType: ChartType;
  labelEntries: LabelEntry[];
  myData: (number | null)[];
  catData: (number | null)[];
  facilityName: string;
  catLabel: string;
  colors: (typeof COLOR_MAP)[keyof typeof COLOR_MAP];
}) {
  const labels = labelEntries.map((e) => e.label);
  const labelTooltip = buildLabelKeyedTooltip(labelEntries);
  const indexTooltip = buildIndexKeyedTooltip(labelEntries);

  const baseDatasets = [
    {
      label: facilityName,
      data: myData,
      backgroundColor: colors.my.fill,
      borderColor: colors.my.stroke,
      borderWidth: 2,
      borderRadius: 5,
      pointBackgroundColor: colors.my.stroke,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
    {
      label: catLabel,
      data: catData,
      backgroundColor: colors.cat.fill,
      borderColor: colors.cat.stroke,
      borderWidth: 2,
      borderRadius: 5,
      pointBackgroundColor: colors.cat.stroke,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ];

  if (chartType === "bar") {
    return (
      <Bar
        data={{ labels, datasets: baseDatasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: legendConfig, tooltip: labelTooltip },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, maxRotation: 30 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { font: { size: 11 }, callback: (v) => formatValue(Number(v)) },
            },
          },
        }}
      />
    );
  }

  if (chartType === "bar-horizontal") {
    return (
      <Bar
        data={{ labels, datasets: baseDatasets }}
        options={{
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: legendConfig, tooltip: labelTooltip },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { font: { size: 10 }, callback: (v) => formatValue(Number(v)) },
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
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
          labels,
          datasets: baseDatasets.map((ds, i) => ({
            ...ds,
            borderDash: i === 1 ? ([6, 3] as number[]) : [],
            fill: false,
            tension: 0.35,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: legendConfig, tooltip: labelTooltip },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { font: { size: 10 }, maxRotation: 30 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { font: { size: 11 }, callback: (v) => formatValue(Number(v)) },
            },
          },
        }}
      />
    );
  }

  // Radar — use index-keyed tooltip since radar item.label = dataset name
  return (
    <Radar
      data={{ labels, datasets: baseDatasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: legendConfig, tooltip: indexTooltip },
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.07)" },
            angleLines: { color: "rgba(0,0,0,0.07)" },
            ticks: {
              font: { size: 9 },
              backdropColor: "transparent",
              callback: (v) => formatValue(Number(v)),
            },
            pointLabels: { font: { size: 10, weight: 600 } },
          },
        },
      }}
    />
  );
}

// ─── Export toolbar ───────────────────────────────────────────────────────────

function ExportToolbar({
  facilityName,
  categoryName,
  year,
  benchmark,
}: {
  facilityName: string;
  categoryName: string;
  year: number;
  benchmark: CategoryWideBenchmark;
}) {
  const [pdfState, setPdfState] = useState<ExportState>("idle");
  const [xlsxState, setXlsxState] = useState<ExportState>("idle");

  const handlePdfExport = async () => {
    if (pdfState === "loading") return;
    setPdfState("loading");
    try {
      const { exportBenchmarkPdf } = await import(
        "@/app/(dashboard)/category-benchmark/benchmark-pdf"
      );
      await exportBenchmarkPdf({
        facilityName,
        categoryName,
        year,
        benchmark,
        logoUrl: "/hh-logo.png",
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setPdfState("idle");
    }
  };

  const handleExcelExport = async () => {
    if (xlsxState === "loading") return;
    setXlsxState("loading");
    try {
      const { exportBenchmarkExcel } = await import(
        "@/app/(dashboard)/category-benchmark/benchmark-excel"
      );
      await exportBenchmarkExcel({ facilityName, categoryName, year, benchmark });
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Excel-Export fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setXlsxState("idle");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePdfExport}
        disabled={pdfState === "loading"}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
          border border-red-200 bg-white text-red-600
          hover:bg-red-50 hover:border-red-300 hover:shadow-sm
          active:bg-red-100 transition-all duration-150
          disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
        "
        title="Benchmark als PDF exportieren"
      >
        {pdfState === "loading" ? (
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4" />
        )}
        {pdfState === "loading" ? "Exportiere…" : "Als PDF exportieren"}
      </button>

      <button
        onClick={handleExcelExport}
        disabled={xlsxState === "loading"}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
          border border-green-200 bg-white text-green-700
          hover:bg-green-50 hover:border-green-300 hover:shadow-sm
          active:bg-green-100 transition-all duration-150
          disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
        "
        title="Benchmark als Excel exportieren"
      >
        {xlsxState === "loading" ? (
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faFileExcel} className="w-4 h-4" />
        )}
        {xlsxState === "loading" ? "Exportiere…" : "Als Excel exportieren"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  facilityName: string;
  categoryName: string;
  year?: number;
  benchmark: CategoryWideBenchmark;
}

export default function Benchmark({
  facilityName,
  categoryName,
  year = new Date().getFullYear(),
  benchmark,
}: Props) {
  const [aggregation, setAggregation] = useState<AggregationType>("median");

  const aggData = benchmark[aggregation];
  const catLabel = `Kategorie ${aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}`;

  return (
    <div className="space-y-6">
      {/* ── Header + controls ────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">{facilityName}</h2>
          <p className="text-sm text-slate-500">
            vs. kategorie &ldquo;{categoryName}&rdquo;
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Aggregation toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {(["median", "average", "min", "max"] as AggregationType[]).map((agg) => {
              const labels: Record<AggregationType, string> = {
                median: "Median",
                average: "Durchschnitt",
                min: "Minimum",
                max: "Maximum",
              };
              return (
                <button
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-colors ${
                    aggregation === agg
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {labels[agg]}
                </button>
              );
            })}
          </div>

          {/* Export toolbar */}
          <ExportToolbar
            facilityName={facilityName}
            categoryName={categoryName}
            year={year}
            benchmark={benchmark}
          />
        </div>
      </div>

      {/* ── KPI sections ────────────────────────────────────────────── */}
      {KPI_SECTIONS.map((section) => {
        const sectionData = aggData[section.key];
        // V2 sections (group/event, personnel) are absent for cat.3 + cat.4.
        if (!sectionData) return null;

        const labelEntries: LabelEntry[] = (sectionData.labels as unknown[]).map(
          normaliseLabelEntry
        );
        const myData: (number | null)[] = sectionData.my_data;
        const catData: (number | null)[] = sectionData.category_data;

        const colors = COLOR_MAP[section.color];
        const chartHeight =
          section.chartType === "radar"
            ? 320
            : section.chartType === "bar-horizontal"
            ? Math.max(220, labelEntries.length * 60)
            : 280;

        return (
          <div
            key={section.key}
            className={`bg-white border ${colors.border} rounded-xl shadow-sm overflow-hidden`}
          >
            {/* Section header */}
            <div
              className={`px-6 py-4 border-b ${colors.border} bg-gradient-to-r ${colors.header} to-white`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.icon}`}
                >
                  <FontAwesomeIcon icon={section.icon} className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{section.label}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="hidden xl:table-header-group">
                    <tr className="border-b border-slate-100">
                      <th className="pb-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Kennzahl
                      </th>
                      <th className="pb-2 px-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Meine Einrichtung
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Kategorie
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Differenz
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {labelEntries.map((entry, i) => (
                      <tr
                        key={`${entry.label}-${i}`}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td colSpan={4} className="xl:hidden py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="block font-medium text-slate-700 leading-snug">
                                {entry.label}
                              </span>
                              {entry.help_text && (
                                <span className="flex items-start gap-1 mt-1">
                                  <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="w-3 h-3 text-slate-400 mt-px shrink-0"
                                  />
                                  <span className="text-xs text-slate-400 leading-snug">
                                    {entry.help_text}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 text-right space-y-1">
                              <div className="text-xs font-bold text-slate-900 tabular-nums">
                                {formatCellValue(myData[i], entry.unit)}
                              </div>
                              <div className="text-xs text-slate-400 tabular-nums">
                                Kat. {formatCellValue(catData[i], entry.unit)}
                              </div>
                              <div>
                                {section.label === "Kosten & Effizienzkennzahlen" ? (
                                  <DeltaBadge my={myData[i]} cat={catData[i]} reverse={true} />
                                ) : (
                                  <DeltaBadge my={myData[i]} cat={catData[i]} />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="hidden xl:table-cell py-3 pr-4">
                          <span className="block font-medium text-slate-700 leading-snug">
                            {entry.label}
                          </span>
                          {entry.help_text && (
                            <span className="flex items-start gap-1 mt-1">
                              <FontAwesomeIcon
                                icon={faCircleInfo}
                                className="w-3 h-3 text-slate-400 mt-px shrink-0"
                              />
                              <span className="text-xs text-slate-400 leading-snug">
                                {entry.help_text}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="hidden xl:table-cell py-3 px-2 text-right font-semibold text-slate-900 tabular-nums align-top">
                          {formatCellValue(myData[i], entry.unit)}
                        </td>
                        <td className="hidden xl:table-cell py-3 text-right text-slate-500 tabular-nums align-top">
                          {formatCellValue(catData[i], entry.unit)}
                        </td>
                        <td className="hidden xl:table-cell py-3 px-2 text-right align-top">
                          {section.label === "Kosten & Effizienzkennzahlen" ? (
                            <DeltaBadge my={myData[i]} cat={catData[i]} reverse={true} />
                          ) : (
                            <DeltaBadge my={myData[i]} cat={catData[i]} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart */}
              <div
                className="p-5 flex items-center justify-center"
                style={{ height: chartHeight }}
              >
                <SectionChart
                  chartType={section.chartType}
                  labelEntries={labelEntries}
                  myData={myData}
                  catData={catData}
                  facilityName={facilityName}
                  catLabel={catLabel}
                  colors={colors}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
