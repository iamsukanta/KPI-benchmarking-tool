import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllFederations } from "@/lib/api/facilities-server";
import FederationCard from "./federation-card";
import { getServerUser } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interner Benchmark"
}

export default async function InternalBenchmarkPage() {
  const [user, { results: federations }] = await Promise.all([
    getServerUser(),
    getAllFederations()
  ]);

  if (user?.role !== "federation_manager") {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Interner Benchmark</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Messen Sie die Leistung Ihres Verbandes anhand von Branchenstandards.
            </p>
          </div>
        </div>
      </div>

      <FederationCard federations={federations || []} />
    </div>
  );
}
