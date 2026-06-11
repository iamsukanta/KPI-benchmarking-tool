import JoiningRequestTable from "@/app/(dashboard)/joining-requests/table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benutzerbeitrittsanfragen"
}

export default function JoiningRequestPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Benutzerbeitrittsanfragen</h1>
            <p className="text-sm text-slate-500 mt-0.5">Anträge auf Zugang zu den Einrichtungen prüfen und genehmigen</p>
          </div>
        </div>
      </div>

      <JoiningRequestTable />
    </>
  );
}
