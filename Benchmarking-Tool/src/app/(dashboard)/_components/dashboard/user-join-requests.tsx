"use client";

import { Facility } from '@/lib/types/facilities';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faBuilding,
  faUserTie,
  faUsers,
  faArrowRight,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

export default function UserJoinRequests({ data }: { data: Facility[] }) {
  function getRoleIcon(role: string) {
    return role === "facility_manager" ? faUserTie : faUsers;
  }

  function getRoleColor(role: string) {
    return role === "facility_manager"
      ? { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600' }
      : { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600' };
  }

  function formatRole(role: string) {
    return role === "facility_manager" ? 'Facility Manager' : 'Föderationsmanager';
  }

  return (
    <div className="card bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="card-header">
        <h2 className="text-lg font-bold text-slate-800">Beitrittsanfragen von Benutzern</h2>
        <p className="text-sm text-slate-500 mt-0.5">Offene Anträge auf Anlagenzugang</p>
      </div>

      <div className="card-body-start px-5 py-4">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserPlus} className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Keine ausstehenden Anfragen</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item, key) => {
              const roleColors = getRoleColor(item.user_facility_role as string);
              const roleIcon = getRoleIcon(item.user_facility_role as string);

              return (
                <div
                  key={key}
                  className="group relative flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150"
                >
                  {key !== data.length - 1 && (
                    <div className="absolute left-[22px] top-12 bottom-0 w-px bg-slate-200" />
                  )}

                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${roleColors.bg} flex items-center justify-center shadow-sm`}>
                    <FontAwesomeIcon icon={roleIcon} className={`w-4 h-4 ${roleColors.icon}`} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-800">{item.user_name}</span>
                      {' '}möchte beitreten als{' a '}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.bg} ${roleColors.text}`}>
                        {formatRole(item.user_facility_role as string)}
                      </span>
                    </p>

                    <Link
                      href={`/facilities/${item.id}/update`}
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors group/link"
                    >
                      <FontAwesomeIcon icon={faBuilding} className="w-3 h-3" />
                      <span className="group-hover/link:underline">{item.name}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <Link
            href="/joining-requests"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>Alle Anfragen anzeigen</span>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
