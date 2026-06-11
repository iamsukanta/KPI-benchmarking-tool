import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

function FederationCardSkeleton() {
  return (
    <div className="space-y-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 h-6 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
        </div>
        <div className="h-6 w-28 bg-brand-100 rounded-full animate-pulse" />
      </div>

      <div className="px-5 pb-5 flex items-center gap-2">
        <div className="w-full flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function InternalBenchmarkLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">InternalBenchmarkLoading</h1>
            <p className="text-sm text-slate-500 mt-0.5">Messen Sie die Leistung Ihres Verbandes anhand von Branchenstandards.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <FederationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
