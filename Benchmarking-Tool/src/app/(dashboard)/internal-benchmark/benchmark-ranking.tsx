"use client";

import { useState } from "react";
import { InternalBenchmark } from "@/lib/types/benchmark";

type SectionKey = keyof InternalBenchmark;

interface RankedFacility {
  rank: number;
  name: string;
  totalScore: number;
  kpiScores: { label: string; value: number; unit: string; rank: number }[];
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtWithUnit(n: number, unit?: string): string {
  return unit ? `${fmt(n)} ${unit}` : fmt(n);
}

function buildRanking(section: InternalBenchmark[SectionKey]): RankedFacility[] {
  const { labels, data } = section;

  const kpiRanks: number[][] = labels.map((_, li) => {
    const vals = data.map(f => ({ name: f.name, value: f.data[li] }));
    const sorted = [...vals].sort((a, b) => b.value - a.value);
    return data.map(f => sorted.findIndex(s => s.name === f.name) + 1);
  });

  const facilities: RankedFacility[] = data.map((f, fi) => ({
    rank: 0,
    name: f.name,
    totalScore: average(f.data),
    kpiScores: labels.map((item, li) => ({
      label: item.label,
      value: f.data[li],
      unit: item.unit ?? "",
      rank: kpiRanks[li][fi],
    })),
  }));

  facilities.sort((a, b) => b.totalScore - a.totalScore);
  facilities.forEach((f, i) => (f.rank = i + 1));
  return facilities;
}

const MEDAL: Record<number, { emoji: string; ring: string; bg: string; text: string }> = {
  1: { emoji: "🥇", ring: "ring-yellow-300", bg: "bg-yellow-50", text: "text-yellow-700" },
  2: { emoji: "🥈", ring: "ring-slate-300", bg: "bg-slate-50", text: "text-slate-600" },
  3: { emoji: "🥉", ring: "ring-amber-300", bg: "bg-amber-50", text: "text-amber-700" },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const m = MEDAL[rank];
    return (
      <div
        className={`w-10 h-10 rounded-full ring-2 ${m.ring} ${m.bg} flex items-center justify-center text-xl flex-shrink-0`}
      >
        {m.emoji}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full ring-2 ring-slate-200 bg-white flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-slate-500">{rank}</span>
    </div>
  );
}

function FacilityRow({ facility, totalFacilities }: { facility: RankedFacility; totalFacilities: number }) {
  const [open, setOpen] = useState(false);
  const m = MEDAL[facility.rank];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${facility.rank <= 3
          ? `${m?.ring.replace("ring-", "border-")} shadow-sm`
          : "border-slate-200"
        }`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <RankBadge rank={facility.rank} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 truncate">{facility.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Ø {fmt(facility.totalScore)} · {facility.kpiScores.length} KPIs
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 w-40">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(1 / totalFacilities) * (totalFacilities - facility.rank + 1) * 100}%`,
                background: facility.rank === 1
                  ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                  : facility.rank === 2
                    ? "linear-gradient(90deg,#94a3b8,#64748b)"
                    : facility.rank === 3
                      ? "linear-gradient(90deg,#fb923c,#ea580c)"
                      : "linear-gradient(90deg,#818cf8,#6366f1)",
              }}
            />
          </div>
        </div>

        <span className="text-xs text-slate-400 select-none">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-2.5 font-semibold text-slate-500">KPI</th>
                <th className="px-5 py-2.5 font-semibold text-slate-500 text-right">Wert</th>
                <th className="px-5 py-2.5 font-semibold text-slate-500 text-center">Rang</th>
              </tr>
            </thead>
            <tbody>
              {facility.kpiScores.map(kpi => (
                <tr key={kpi.label} className="border-t border-slate-100">
                  <td className="px-5 py-2 text-slate-700 whitespace-nowrap">{kpi.label}</td>
                  <td className="px-5 py-2 tabular-nums text-slate-600 text-right whitespace-nowrap">
                    {fmtWithUnit(kpi.value, kpi.unit)}
                  </td>
                  <td className="px-5 py-2 text-center">
                    {kpi.rank <= 3 ? (
                      <span className="text-base leading-none">{MEDAL[kpi.rank].emoji}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">{kpi.rank}.</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const SECTION_META: Record<string, { label: string; bg: string; border: string }> = {
  occupancy_utilization: { label: "Belegung & Nutzung", bg: "from-brand-50 to-white", border: "border-brand-100" },
  revenue_kpis: { label: "Erlöskennzahlen", bg: "from-orange-50 to-white", border: "border-orange-100" },
  cost_efficiency_kpis: { label: "Kosten & Effizienzkennzahlen", bg: "from-teal-50 to-white", border: "border-teal-100" },
  category_specific_kpis: { label: "Kategorie-spezifische Kennzahlen", bg: "from-purple-50 to-white", border: "border-purple-100" },
};

const SECTION_KEYS: SectionKey[] = [
  "occupancy_utilization",
  "revenue_kpis",
  "cost_efficiency_kpis",
  "category_specific_kpis",
];

function SectionRanking({
  sectionKey,
  section,
}: {
  sectionKey: string;
  section: InternalBenchmark[SectionKey];
}) {
  const meta = SECTION_META[sectionKey];
  const facilities = buildRanking(section);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`px-5 py-4 border-b bg-gradient-to-r ${meta.bg} ${meta.border}`}>
        <h3 className="text-sm font-bold text-slate-800">{meta.label}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Ranking basierend auf dem Durchschnitt aller KPIs · {facilities.length} Einrichtungen
        </p>
      </div>
      <div className="p-4 space-y-3">
        {facilities.map(f => (
          <FacilityRow key={f.name} facility={f} totalFacilities={facilities.length} />
        ))}
      </div>
    </div>
  );
}

export default function BenchmarkRanking({ benchmark }: { benchmark: InternalBenchmark }) {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>("occupancy_utilization");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🏆</div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Ranking</h2>
          <p className="text-xs text-slate-500">
            Klicken Sie auf eine Einrichtung, um die KPI-Einzelränge zu sehen
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTION_KEYS.map(key => {
          const m = SECTION_META[key];
          const isActive = key === activeSectionKey;
          return (
            <button
              key={key}
              onClick={() => setActiveSectionKey(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? "bg-slate-800 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <SectionRanking
        sectionKey={activeSectionKey}
        section={benchmark[activeSectionKey]}
      />
    </div>
  );
}
