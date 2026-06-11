import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

function FacilityCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 h-6 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
        </div>
        <div className="h-6 w-28 bg-brand-100 rounded-full animate-pulse" />
      </div>

      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-10 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-6 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center gap-2">
        <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="flex-1 h-10 bg-red-50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function FacilitiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Facilities</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and view all facilities</p>
          </div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <FacilityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
