"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCalendar,
  faBuilding,
  faExclamationTriangle,
  faSpinner,
  faArrowRight,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { submitCategoryWideBenchmark } from "@/app/(dashboard)/category-benchmark/actions";
import {
  CategoryWideBenchmarkResponse,
  CategoryWideBenchmarkEligibleFacility,
} from "@/lib/types/benchmark";
import Benchmark from "@/app/(dashboard)/category-benchmark/benchmark";

type BenchmarkResult =
  | { ok: true; data: CategoryWideBenchmarkResponse }
  | { ok: false; message: string };

export default function BenchmarkClient({
  facilities,
}: {
  facilities: CategoryWideBenchmarkEligibleFacility[];
}) {
  const [selectedFacility, setSelectedFacility] =
    useState<CategoryWideBenchmarkEligibleFacility | null>(null);
  const [year, setYear] = useState<string>("");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (facility: CategoryWideBenchmarkEligibleFacility) => {
    setSelectedFacility(facility);
    setResult(null);
    const sorted = [...facility.years].sort((a, b) => b - a);
    setYear(sorted[0] ? String(sorted[0]) : "");
  };

  const handleLoad = () => {
    if (!selectedFacility || !year) return;

    startTransition(async () => {
      try {
        const data = await submitCategoryWideBenchmark(
          selectedFacility.id,
          Number(year)
        );
        setResult({ ok: true, data });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Benchmark-Daten konnten nicht abgerufen werden.";
        setResult({ ok: false, message });
      }
    });
  };

  const renderError = (msg: string, variant: "red" | "amber" = "red") => {
    const colors =
      variant === "amber"
        ? {
            bg: "bg-amber-50",
            border: "border-amber-200",
            icon: "text-amber-600",
            title: "text-amber-800",
            body: "text-amber-700",
          }
        : {
            bg: "bg-red-50",
            border: "border-red-200",
            icon: "text-red-600",
            title: "text-red-800",
            body: "text-red-600",
          };

    return (
      <div
        className={`${colors.bg} border ${colors.border} rounded-xl p-6 flex items-start gap-3 mt-6`}
      >
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className={`w-5 h-5 ${colors.icon} mt-0.5 flex-shrink-0`}
        />
        <div>
          <p className={`text-sm font-semibold ${colors.title}`}>Fehler</p>
          <p className={`text-sm ${colors.body} mt-1`}>{msg}</p>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.ok) return renderError(result.message);

    const { data } = result;

    if (data.status === "error") {
      if (data.type === "validation_error") {
        const msgs = Object.values(data.errors).flat().join(" · ");
        return renderError(msgs, "amber");
      }
      return renderError(data.message);
    }

    const benchmark = data.results.benchmark ?? (data as any).benchmark;

    return (
      <div className="mt-6">
        {/* ↓ year is now forwarded so the export utilities can embed it */}
        <Benchmark
          facilityName={data.results.facility.name}
          categoryName={data.results.facility.category_name}
          year={Number(year)}
          benchmark={benchmark}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faChartLine}
            className="w-6 h-6 text-brand-600"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Kategorieweiter Benchmark
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Vergleichen Sie Ihre Einrichtung hinsichtlich aller KPI-Dimensionen mit Ihrer Kategorie
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faBuilding}
              className="w-4 h-4 text-slate-400"
            />
            Wählen Sie Einrichtung
          </h2>
        </div>

        <div className="p-6">
          {facilities.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Es wurden keine geeigneten Einrichtungen gefunden.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {facilities.map((f) => {
                const isSelected = selectedFacility?.id === f.id;
                return (
                  <div
                    key={f.id}
                    className={`
                      group relative rounded-xl border-2 p-5 cursor-pointer
                      transition-all duration-200 hover:shadow-md
                      ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/60 shadow-sm"
                          : "border-slate-200 bg-white hover:border-brand-300"
                      }
                    `}
                    onClick={() => handleSelect(f)}
                  >
                    <p
                      className={`font-semibold text-sm mb-3 ${
                        isSelected ? "text-brand-800" : "text-slate-800"
                      }`}
                    >
                      {f.name}
                    </p>

                    {f.category_name && (
                      <span
                        className={`
                          inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium
                          ${
                            isSelected
                              ? "bg-brand-100 text-brand-700"
                              : "bg-brand-50 text-brand-600"
                          }
                        `}
                      >
                        <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                        {f.category_name}
                      </span>
                    )}

                    <button
                      className={`
                        mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                        text-sm font-semibold border transition-all duration-150
                        ${
                          isSelected
                            ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                            : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50"
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(f);
                      }}
                    >
                      {isSelected ? "Ausgewählt ✓" : "Wählen"}
                      {!isSelected && (
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="w-3.5 h-3.5"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedFacility && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faCalendar}
                className="w-4 h-4 text-slate-400"
              />
              Wählen Sie Jahr Aus
              <span className="ml-1 text-xs font-normal text-slate-400">
                — {selectedFacility.years.length} jahr
                {selectedFacility.years.length !== 1 ? "s" : ""} verfügbar
              </span>
            </h2>
          </div>
          <div className="p-6">
            {selectedFacility.years.length === 0 ? (
              <p className="text-sm text-slate-400">
                Für diese Einrichtung sind keine Jahre verfügbar.
              </p>
            ) : (
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setResult(null);
                }}
                className="w-full max-w-xs px-4 py-3 rounded-lg bg-white border border-slate-300
                  text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500
                  focus:border-brand-500 transition-colors text-sm"
              >
                {[...selectedFacility.years]
                  .sort((a, b) => b - a)
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>
      )}

      {selectedFacility && (
        <div className="flex justify-end">
          <button
            onClick={handleLoad}
            disabled={isPending || !year}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600
              text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800
              transition-colors shadow-sm hover:shadow disabled:opacity-60
              disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="w-4 h-4 animate-spin"
                />
                Laden…
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />
                Benchmark Laden
              </>
            )}
          </button>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="w-7 h-7 text-brand-500 animate-spin"
              />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Benchmark-Daten werden abgerufen…
          </p>
          <p className="text-xs text-slate-400 mt-1">Dies kann einen Moment dauern</p>
        </div>
      )}

      {!isPending && renderResult()}

      {!isPending && !result && !selectedFacility && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="w-10 h-10 text-brand-500"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Bereit zum Benchmarking
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Wählen Sie oben eine Einrichtung aus und anschließend ein Jahr, um alle KPI-Dimensionen mit dem Kategorie-Benchmark zu vergleichen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
