"use client";

import { FacilityDashboardData } from '@/lib/types/auth';

export default function Facilities({ data }: { data: FacilityDashboardData }) {
  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title-junior">Einrichtungen</h1>
      </div>

      <div className="card-body justify-center px-7 pb-4 min-h-[180px] max-h-[360px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-6">
          <div className="bg-white w-full max-w-xs border-r border-slate-200">
            <h1 className="text-4xl font-bold text-slate-900">
              {data.total_facilities_and_federations}
            </h1>
            <p className="mt-5 text-sm font-medium">
              Gesamtanlagen & Verbände
            </p>
          </div>

          <div className="bg-white w-full max-w-xs border-r border-slate-200">
            <h1 className="text-4xl font-bold text-slate-900">
              {data.total_federations}
            </h1>
            <p className="mt-5 text-sm font-medium">
              Gesamtverbände
            </p>
          </div>

          <div className="bg-white w-full max-w-xs">
            <h1 className="text-4xl font-bold text-slate-900">
              {data.total_facilities}
            </h1>
            <p className="mt-5 text-sm font-medium">
              Gesamtausstattung
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
