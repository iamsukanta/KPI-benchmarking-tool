import { redirect } from "next/navigation";
import { fetchFacilitiesAction } from "@/app/(dashboard)/facilities/actions";
import { getServerUser } from "@/lib/auth/server";
import AllFacilitiesTable from "@/app/(dashboard)/all-facilities/all-facilities-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingUser } from "@fortawesome/free-solid-svg-icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alle Einrichtungen & Föderation"
};

export default async function AllFacilitiesPage() {
  const [user, { results: facilities }] = await Promise.all([
    getServerUser(),
    fetchFacilitiesAction()
  ]);

  if (user?.role !== "admin") {
    redirect("/");
  }

  const facilityList = facilities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faBuildingUser} className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alle Einrichtungen &amp; Föderation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Übersicht aller Einrichtungen und Föderationen verwalten
          </p>
        </div>
      </div>

      <AllFacilitiesTable initialFacilities={facilityList} />
    </div>
  );
}
