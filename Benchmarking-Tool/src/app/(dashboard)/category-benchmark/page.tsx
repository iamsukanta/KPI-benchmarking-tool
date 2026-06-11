import { eligibleFacilities } from "@/app/(dashboard)/category-benchmark/actions";
import { CategoryWideBenchmarkEligibleFacility } from "@/lib/types/benchmark";
import BenchmarkClient from "@/app/(dashboard)/category-benchmark/benchmark-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { getServerUser } from "@/lib/auth/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategorieweiter Benchmark"
}

export default async function CategoryBenchmarkPage() {
  const user = await getServerUser();
    
  if (user?.role === "admin") {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">Berechtigungsfehler</h3>
          <p className="text-sm text-red-600 mt-1">Entschuldigung, Sie haben keine Berechtigung, diese Seite zu besuchen.</p>
        </div>
      </div>
    );
  }

  let facilities: CategoryWideBenchmarkEligibleFacility[] = [];
  try {
    const res = await eligibleFacilities();
    facilities = res.results;
  } catch {
    // non-fatal — client will render empty state
  }

  return <BenchmarkClient facilities={facilities} />;
}

