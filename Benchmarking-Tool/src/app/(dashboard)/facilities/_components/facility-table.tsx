"use client";

import { Facility } from "@/lib/types/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faBuilding,
  faDoorOpen,
  faBed,
  faTag
} from '@fortawesome/free-solid-svg-icons';

export default function FacilityTable({
  data
}: {
  data: Facility[];
}) {
  return (
    <div>
      {data.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="w-9 h-9 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No facilities found</p>
            <p className="text-sm text-slate-500 mt-1">There are no facilities available at the moment</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                </div>

                {item.is_federation && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 mr-1">
                    <FontAwesomeIcon icon={faBuilding} className="w-3 h-3" />
                    <span className="text-xs font-semibold">Federation</span>
                  </div>
                )}

                {item.category_name && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                  <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                  <span className="text-xs font-medium">{item.category_name}</span>
                </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                {!item.is_federation ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faDoorOpen} className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Rooms</p>
                        <p className="text-base font-bold text-slate-800">{item.rooms}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Beds</p>
                        <p className="text-base font-bold text-slate-800">{item.beds}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Type</p>
                      <p className="text-sm font-bold text-slate-800">Federation</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <Link
                  href={`/facilities/${item.id}/detail`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 shadow-sm hover:shadow"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
