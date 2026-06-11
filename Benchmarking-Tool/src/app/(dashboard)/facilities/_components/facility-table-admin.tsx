"use client";

import { Facility } from "@/lib/types/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrashCan,
  faCheckCircle,
  faXmarkCircle,
  faBuilding,
  faDoorOpen,
  faBed,
  faTag,
  faUser
} from '@fortawesome/free-solid-svg-icons';

export default function FacilityTableAdmin({
 data,
 onDeleteAction
}: {
 data: Facility[];
 onDeleteAction: (facilityId: number) => Promise<void>;
}) {
  return (
    <>
      {data.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="w-9 h-9 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No facilities found</p>
            <p className="text-sm text-slate-500 mt-1">Get started by adding your first facility</p>
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
                  <div className="flex-shrink-0">
                    {item.is_user_approved ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        <span className="text-xs font-semibold">Approved</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                        <FontAwesomeIcon icon={faXmarkCircle} className="w-3 h-3" />
                        <span className="text-xs font-semibold">Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                  <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                  <span className="text-xs font-medium">{item.category_name}</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {! item.is_federation ? (
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
                ): (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Type</p>
                        <p className="text-sm font-bold text-slate-800">Federation</p>
                      </div>
                    </div>
                  )
                }

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">Managed by</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.user_name}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex items-center justify-center gap-2">
                <Link
                  href={`/facilities/${item.id}/update`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                  border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50
                  hover:border-slate-300 active:bg-slate-100 transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => onDeleteAction(item.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                  border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50
                  hover:border-red-300 active:bg-red-100 transition-all shadow-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
