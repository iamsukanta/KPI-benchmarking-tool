import type { Metadata } from "next";
import { getServerUser } from "@/lib/auth/server";
import { fetchFacilityYearlyData } from "../action";
import { faArrowLeft, faBuilding, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import FacilityDetailUpdateFormPage from "./update";

export const metadata: Metadata = {
  title: "Jährliche Daten"
}

type Props = {
  params: Promise<{
    facilityId: number;
    detailId: number;
  }>
}

export default async function FacilityDetailUpdatePage({ params }: Props) {
  const { facilityId, detailId } = await params;
  const user = await getServerUser();

  if (user?.role !== "facility_manager") {
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

  const res = await fetchFacilityYearlyData(facilityId, detailId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <Link
          href={`/facilities/${facilityId}/detail`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          <span>Zurück zu den Jahresdaten</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Aktualisieren Sie die Jahresdetails für {res.facility_name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Jährliche Daten</p>
          </div>
        </div>
      </div>

      <FacilityDetailUpdateFormPage facilityId={facilityId} detailId={detailId} data={res} />
    </div>
  );
}
