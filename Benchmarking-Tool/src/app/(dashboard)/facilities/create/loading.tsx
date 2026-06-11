import { faArrowLeft, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function FacilityCreateLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/facilities"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          <span>Back to Facilities</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-48"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-11 bg-slate-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-11 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
