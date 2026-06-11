"use client";

import { InternalBenchmark } from "@/lib/types/benchmark";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SectionKey = keyof InternalBenchmark;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtWithUnit(n: number, unit?: string): string {
  return unit ? `${fmt(n)} ${unit}` : fmt(n);
}

interface StatRow {
  label: string;
  help_text: string;
  unit: string;
  avg: number;
  med: number;
  min: number;
  max: number;
  spread: number;
}

function buildRows(section: InternalBenchmark[SectionKey]): StatRow[] {
  return section.labels.map((item, li) => {
    const vals = section.data.map(f => f.data[li]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return {
      label: item.label,
      help_text: item.help_text,
      unit: item.unit ?? "",
      avg: average(vals),
      med: median(vals),
      min,
      max,
      spread: max - min,
    };
  });
}

function MiniBar({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const range = max - min || 1;
  const pct = ((value - min) / range) * 100;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-600 w-14 text-right">{fmt(value)}</span>
    </div>
  );
}

const SECTION_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  occupancy_utilization: {
    label: "Belegung & Nutzung",
    color: "#6366f1",
    bg: "from-brand-50 to-white",
    border: "border-brand-100",
  },
  revenue_kpis: {
    label: "Erlöskennzahlen",
    color: "#f97316",
    bg: "from-orange-50 to-white",
    border: "border-orange-100",
  },
  cost_efficiency_kpis: {
    label: "Kosten & Effizienzkennzahlen",
    color: "#0d9488",
    bg: "from-teal-50 to-white",
    border: "border-teal-100",
  },
  category_specific_kpis: {
    label: "Kategorie-spezifische Kennzahlen",
    color: "#9333ea",
    bg: "from-purple-50 to-white",
    border: "border-purple-100",
  },
};

function SectionStats({
  sectionKey,
  section,
}: {
  sectionKey: string;
  section: InternalBenchmark[SectionKey];
}) {
  const meta = SECTION_META[sectionKey] ?? {
    label: sectionKey,
    color: "#6366f1",
    bg: "from-slate-50 to-white",
    border: "border-slate-100",
  };
  const rows = buildRows(section);

  const globalMin = Math.min(...rows.map(r => r.min));
  const globalMax = Math.max(...rows.map(r => r.max));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* header */}
      <div className={`px-5 py-4 border-b bg-gradient-to-r ${meta.bg} ${meta.border}`}>
        <h3 className="text-sm font-bold text-slate-800">{meta.label}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {section.data.length} Einrichtungen · {rows.length} KPIs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">KPI</th>
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Ø Mittel</th>
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Median</th>
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Min</th>
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Max</th>
              <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Spanne</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.label}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                  <span className="flex flex-col gap-1">
                    {row.label}
                    <span className="flex gap-1.5 text-slate-500">
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="w-2 h-2 text-slate-400 cursor-help"
                      />
                      <small>{row.help_text}</small>
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-700 text-right font-semibold whitespace-nowrap">
                  {fmtWithUnit(row.avg, row.unit)}
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-600 text-right whitespace-nowrap">
                  {fmtWithUnit(row.med, row.unit)}
                </td>
                <td className="px-5 py-3 tabular-nums text-emerald-600 text-right whitespace-nowrap">
                  {fmtWithUnit(row.min, row.unit)}
                </td>
                <td className="px-5 py-3 tabular-nums text-rose-600 text-right whitespace-nowrap">
                  {fmtWithUnit(row.max, row.unit)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <MiniBar
                    value={row.avg}
                    min={globalMin}
                    max={globalMax}
                    color={meta.color}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SECTION_KEYS: SectionKey[] = [
  "occupancy_utilization",
  "revenue_kpis",
  "cost_efficiency_kpis",
  "category_specific_kpis",
];

export default function BenchmarkStats({ benchmark }: { benchmark: InternalBenchmark }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📊</div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Statistische Kennzahlen</h2>
          <p className="text-xs text-slate-500">Mittelwert, Median, Minimum und Maximum je KPI</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        {[
          { color: "text-slate-700 font-semibold", label: "Ø Mittel — arithmetischer Durchschnitt" },
          { color: "text-slate-500", label: "Median — mittlerer Rang" },
          { color: "text-emerald-600", label: "Min — niedrigster Wert" },
          { color: "text-rose-600", label: "Max — höchster Wert" },
        ].map(({ color, label }) => (
          <span key={label} className={`inline-flex items-center gap-1 ${color}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
            {label}
          </span>
        ))}
      </div>

      {SECTION_KEYS.map(key => (
        <SectionStats key={key} sectionKey={key} section={benchmark[key]} />
      ))}
    </div>
  );
}
