import FacilityCreateForm from "@/app/(dashboard)/facilities/_components/facility-create-form";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBuilding, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { getServerUser } from "@/lib/auth/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Einrichtung erstellen"
}

export default async function FacilityCreatePage() {
  const user = await getServerUser();

  if (user?.role !== "admin") {
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <Link
          href="/facilities"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          <span>Zurück zu Einrichtungen</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Erstellen Sie eine neue Einrichtung</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fügen Sie Ihrem System eine neue Einrichtung hinzu</p>
          </div>
        </div>
      </div>

      <FacilityCreateForm />
    </div>
  );
}
