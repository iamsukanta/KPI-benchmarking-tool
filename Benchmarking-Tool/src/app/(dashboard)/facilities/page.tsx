import Link from "next/link";
import { fetchFacilitiesAction } from "@/app/(dashboard)/facilities/actions";
import { getServerUser } from "@/lib/auth/server";
import FacilityHelper from "@/app/(dashboard)/facilities/facility-helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBuilding } from "@fortawesome/free-solid-svg-icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Einrichtungen"
}

export default async function FacilityPage() {
  const [user, { results: facilities }] = await Promise.all([
    getServerUser(),
    fetchFacilitiesAction(),
  ]);

  const isAdmin = user?.role === "admin";
  const facilityList = facilities ?? [];
  const facilityCount = facilityList.filter(facility => ! facility?.is_federation).length;
  const federationCount = facilityList.filter(facility => facility?.is_federation).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Einrichtungen</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Alle Einrichtungen verwalten und anzeigen
              {facilityCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-700">
                  {facilityCount} {facilityCount === 1 ? "einrichtung" : "einrichtungen"}
                </span>
              )}
              {federationCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-700">
                  {federationCount} {federationCount === 1 ? "föderation" : "verbände"}
                </span>
              )}
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/facilities/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white
            text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 transition-all duration-150
            shadow-sm hover:shadow-md"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>Einrichtung erstellen</span>
          </Link>
        )}
      </div>

      <FacilityHelper initialFacilities={facilityList} isAdmin={isAdmin} />
    </div>
  );
}
