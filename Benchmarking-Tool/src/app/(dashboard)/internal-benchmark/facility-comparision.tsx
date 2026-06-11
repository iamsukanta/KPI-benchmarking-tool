"use client";

import { useState } from "react";
import { InternalBenchmark } from "@/lib/types/benchmark";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SectionKey = keyof InternalBenchmark;

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

function pctDiff(value: number, avg: number): number {
  if (avg === 0) return 0;
  return ((value - avg) / Math.abs(avg)) * 100;
}

function DeltaBadge({ delta }: { delta: number }) {
  const abs = Math.abs(delta).toFixed(1);
  const better = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${better
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
        }`}
    >
      <span>{better ? "▲" : "▼"}</span>
      {abs}%
    </span>
  );
}

function ComparisonTable({
  section,
  facilityIndex,
}: {
  section: InternalBenchmark[SectionKey];
  facilityIndex: number;
}) {
  const facility = section.data[facilityIndex];
  if (!facility) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">KPI</th>
            <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">
              {facility.name}
            </th>
            <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">
              Ø Verbund
            </th>
            <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap text-center">
              Differenz
            </th>
            <th className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Vergleich</th>
          </tr>
        </thead>
        <tbody>
          {section.labels.map((label, li) => {
            const allVals = section.data.map(f => f.data[li]);
            const avg = average(allVals);
            const val = facility.data[li];
            const delta = pctDiff(val, avg);
            const barPct = Math.min(Math.abs(delta), 100);
            const better = delta >= 0;
            const unit = label.unit ?? "";

            return (
              <tr
                key={label.label}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                  <span className="flex flex-col gap-1">
                    {label.label}
                    <span className="flex gap-1.5 text-slate-500">
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="w-2 h-2 text-slate-400 cursor-help"
                      />
                      <small>{label.help_text}</small>
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-800 font-semibold text-right whitespace-nowrap">
                  {fmtWithUnit(val, unit)}
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-500 text-right whitespace-nowrap">
                  {fmtWithUnit(avg, unit)}
                </td>
                <td className="px-5 py-3 text-center whitespace-nowrap">
                  <DeltaBadge delta={delta} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap min-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    {/* left (worse) bar */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-2 rounded-full bg-rose-400 transition-all duration-500"
                        style={{ width: better ? "0%" : `${barPct}%`, minWidth: better ? 0 : 4 }}
                      />
                    </div>
                    {/* centre line */}
                    <div className="w-px h-3 bg-slate-300 flex-shrink-0" />
                    {/* right (better) bar */}
                    <div className="flex-1">
                      <div
                        className="h-2 rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: better ? `${barPct}%` : "0%", minWidth: better ? 4 : 0 }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

function SummaryPills({
  benchmark,
  facilityIndex,
}: {
  benchmark: InternalBenchmark;
  facilityIndex: number;
}) {
  let better = 0, worse = 0;

  SECTION_KEYS.forEach(key => {
    const section = benchmark[key];
    const facility = section.data[facilityIndex];
    if (!facility) return;
    section.labels.forEach((_, li) => {
      const allVals = section.data.map(f => f.data[li]);
      const avg = average(allVals);
      if (facility.data[li] >= avg) better++;
      else worse++;
    });
  });

  const total = better + worse;
  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
        <span className="text-emerald-600 text-lg">▲</span>
        <div>
          <p className="text-xs font-semibold text-emerald-700">Über dem Durchschnitt</p>
          <p className="text-xl font-bold text-emerald-700">{better}</p>
        </div>
        <span className="ml-1 text-xs text-emerald-500">von {total} KPIs</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg">
        <span className="text-rose-600 text-lg">▼</span>
        <div>
          <p className="text-xs font-semibold text-rose-700">Unter dem Durchschnitt</p>
          <p className="text-xl font-bold text-rose-700">{worse}</p>
        </div>
        <span className="ml-1 text-xs text-rose-500">von {total} KPIs</span>
      </div>
    </div>
  );
}

export default function FacilityComparison({ benchmark }: { benchmark: InternalBenchmark }) {
  const allFacilities = benchmark.occupancy_utilization.data.map(f => f.name);

  const [selectedName, setSelectedName] = useState<string>("");
  const [activeSection, setActiveSection] = useState<SectionKey>("occupancy_utilization");

  const selectedIndex = allFacilities.indexOf(selectedName);
  const hasSelection = selectedIndex !== -1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🔍</div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Einrichtungsvergleich</h2>
          <p className="text-xs text-slate-500">
            Position einer Einrichtung gegenüber dem Verbundsdurchschnitt
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Einrichtung auswählen
        </label>
        <select
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
          className="w-full sm:max-w-sm px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors cursor-pointer"
        >
          <option value="">– Einrichtung wählen –</option>
          {allFacilities.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {hasSelection ? (
        <>
          <SummaryPills benchmark={benchmark} facilityIndex={selectedIndex} />

          <div className="flex flex-wrap gap-2">
            {SECTION_KEYS.map(key => {
              const m = SECTION_META[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeSection === key
                      ? "bg-slate-800 text-white shadow"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                    }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {(() => {
            const m = SECTION_META[activeSection];
            const s = benchmark[activeSection];
            return (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className={`px-5 py-4 border-b bg-gradient-to-r ${m.bg} ${m.border}`}>
                  <h3 className="text-sm font-bold text-slate-800">{m.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedName} vs. Verbunddurchschnitt · {s.labels.length} KPIs
                  </p>
                </div>
                <ComparisonTable section={s} facilityIndex={
                  s.data.findIndex(f => f.name === selectedName)
                } />
              </div>
            );
          })()}
        </>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm">
            Wählen Sie oben eine Einrichtung, um den Vergleich zu sehen.
          </p>
        </div>
      )}
    </div>
  );
}
