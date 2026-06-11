"use client";

import { useState } from "react";
import { InternalBenchmark } from "@/lib/types/benchmark";

type SectionKey = keyof InternalBenchmark;

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function pctDiff(value: number, avg: number): number {
  if (avg === 0) return 0;
  return ((value - avg) / Math.abs(avg)) * 100;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtWithUnit(n: number, unit?: string): string {
  return unit ? `${fmt(n)} ${unit}` : fmt(n);
}

interface KpiInsight {
  section: string;
  label: string;
  value: number;
  avg: number;
  delta: number;
  unit: string;
}

interface FacilityInsights {
  name: string;
  strengths: KpiInsight[];
  improvements: KpiInsight[];
}

const SECTION_LABELS: Record<string, string> = {
  occupancy_utilization: "Belegung & Nutzung",
  revenue_kpis: "Erlöskennzahlen",
  cost_efficiency_kpis: "Kosten & Effizienzkennzahlen",
  category_specific_kpis: "Kategorie-spezifische Kennzahlen",
};

const SECTION_KEYS: SectionKey[] = [
  "occupancy_utilization",
  "revenue_kpis",
  "cost_efficiency_kpis",
  "category_specific_kpis",
];

function buildInsights(benchmark: InternalBenchmark): FacilityInsights[] {
  const names = benchmark.occupancy_utilization.data.map(f => f.name);

  return names.map(name => {
    const strengths: KpiInsight[] = [];
    const improvements: KpiInsight[] = [];

    SECTION_KEYS.forEach(key => {
      const section = benchmark[key];
      const facility = section.data.find(f => f.name === name);
      if (!facility) return;

      section.labels.forEach((item, li) => {
        const allVals = section.data.map(f => f.data[li]);
        const avg = average(allVals);
        const val = facility.data[li];
        const delta = pctDiff(val, avg);

        const insight: KpiInsight = {
          section: SECTION_LABELS[key] ?? key,
          label: item.label,
          value: val,
          avg,
          delta,
          unit: item.unit ?? "",
        };

        if (delta >= 0) strengths.push(insight);
        else improvements.push(insight);
      });
    });

    strengths.sort((a, b) => b.delta - a.delta);
    improvements.sort((a, b) => a.delta - b.delta);

    return { name, strengths, improvements };
  });
}

function InsightRow({ insight, type }: { insight: KpiInsight; type: "strength" | "improvement" }) {
  const isStrength = type === "strength";
  const absDelta = Math.abs(insight.delta);

  return (
    <div className="flex items-start gap-3 py-2.5 border-t border-slate-100 first:border-t-0">
      <span className="text-base mt-0.5 flex-shrink-0">
        {isStrength ? "✅" : "⚠️"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 truncate">{insight.label}</span>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full whitespace-nowrap">
            {insight.section}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span>
            Wert:{" "}
            <span className="font-semibold text-slate-700 tabular-nums">
              {fmtWithUnit(insight.value, insight.unit)}
            </span>
          </span>
          <span>·</span>
          <span>
            Ø:{" "}
            <span className="tabular-nums">
              {fmtWithUnit(insight.avg, insight.unit)}
            </span>
          </span>
          <span
            className={`font-semibold ${isStrength ? "text-emerald-600" : "text-rose-600"}`}
          >
            {isStrength ? "+" : "−"}{absDelta.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center w-20 flex-shrink-0">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isStrength ? "bg-emerald-400" : "bg-rose-400"
            }`}
            style={{ width: `${Math.min(absDelta, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function FacilityInsightCard({ insights }: { insights: FacilityInsights }) {
  const [tab, setTab] = useState<"strength" | "improvement">("strength");

  const items = tab === "strength" ? insights.strengths : insights.improvements;
  const topN = items.slice(0, 5);

  const hasBoth = insights.strengths.length > 0 && insights.improvements.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
          🏢
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{insights.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-semibold">{insights.strengths.length} Stärken</span>
            {" · "}
            <span className="text-rose-600 font-semibold">
              {insights.improvements.length} Verbesserungspotenziale
            </span>
          </p>
        </div>
      </div>

      {hasBoth && (
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setTab("strength")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              tab === "strength"
                ? "text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            ✅ Stärken ({insights.strengths.length})
          </button>
          <button
            onClick={() => setTab("improvement")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              tab === "improvement"
                ? "text-rose-700 border-b-2 border-rose-500 bg-rose-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            ⚠️ Verbesserungspotenzial ({insights.improvements.length})
          </button>
        </div>
      )}

      <div className="px-5 py-1 divide-y divide-slate-100">
        {topN.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Keine Einträge</p>
        ) : (
          topN.map((insight, i) => (
            <InsightRow key={`${insight.section}-${insight.label}-${i}`} insight={insight} type={tab} />
          ))
        )}
      </div>

      {items.length > 5 && (
        <div className="px-5 pb-3 text-center">
          <p className="text-xs text-slate-400">
            + {items.length - 5} weitere — wählen Sie den Einrichtungsvergleich für alle Details
          </p>
        </div>
      )}
    </div>
  );
}

function FederationSummary({ allInsights }: { allInsights: FacilityInsights[] }) {
  const topFacility = [...allInsights].sort(
    (a, b) => b.strengths.length - a.strengths.length
  )[0];

  const kpiStrengthCounts: Record<string, number> = {};
  allInsights.forEach(fi =>
    fi.strengths.forEach(s => {
      kpiStrengthCounts[s.label] = (kpiStrengthCounts[s.label] ?? 0) + 1;
    })
  );
  const topKpi = Object.entries(kpiStrengthCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100 rounded-xl p-5">
      <p className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-3">
        Verbund-Snapshot
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topFacility && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🥇</span>
            <div>
              <p className="text-xs text-slate-500">Stärkste Einrichtung</p>
              <p className="text-sm font-bold text-slate-800">{topFacility.name}</p>
              <p className="text-xs text-emerald-600">
                {topFacility.strengths.length} KPIs über dem Durchschnitt
              </p>
            </div>
          </div>
        )}
        {topKpi && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-xs text-slate-500">Häufigste Stärke</p>
              <p className="text-sm font-bold text-slate-800">{topKpi}</p>
              <p className="text-xs text-brand-600">
                {kpiStrengthCounts[topKpi]} von {allInsights.length} Einrichtungen über Ø
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BenchmarkInsights({ benchmark }: { benchmark: InternalBenchmark }) {
  const allInsights = buildInsights(benchmark);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">💡</div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Automatische Einblicke</h2>
          <p className="text-xs text-slate-500">
            Stärken und Verbesserungspotenziale je Einrichtung gegenüber dem Verbundsdurchschnitt
          </p>
        </div>
      </div>

      <FederationSummary allInsights={allInsights} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allInsights.map(fi => (
          <FacilityInsightCard key={fi.name} insights={fi} />
        ))}
      </div>
    </div>
  );
}
