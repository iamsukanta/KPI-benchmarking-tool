"use client";

import { ActivityDashboardData } from '@/lib/types/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faUserXmark, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

export default function UserApprovals({ data }: { data: ActivityDashboardData[] }) {
  function humanizeDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getRelativeTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m vor`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h vor`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d vor`;
    return humanizeDate(dateStr);
  }

  function getApprovalIcon(activity: string) {
    const normalizedActivity = activity.toLowerCase();
    if (normalizedActivity.includes('approved')) {
      return { icon: faUserCheck, color: 'text-emerald-500', bg: 'bg-emerald-100' };
    }
    if (normalizedActivity.includes('rejected') || normalizedActivity.includes('denied')) {
      return { icon: faUserXmark, color: 'text-red-500', bg: 'bg-red-100' };
    }
    return { icon: faShieldHalved, color: 'text-blue-500', bg: 'bg-blue-100' };
  }

  return (
    <div className="card bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="card-header">
        <h2 className="text-lg font-bold text-slate-800">Benutzergenehmigungen</h2>
        <p className="text-sm text-slate-500 mt-0.5">Administrator-Genehmigungsverlauf</p>
      </div>

      <div className="card-body px-6 py-4">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Noch keine Genehmigungsaktivitäten</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item, key) => {
              const { icon, color, bg } = getApprovalIcon(item.activity);
              const activityText = item.activity.charAt(0).toUpperCase() + item.activity.slice(1);

              return (
                <div
                  key={key}
                  className="group relative flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150"
                >
                  {key !== data.length - 1 && (
                    <div className="absolute left-[22px] top-12 bottom-0 w-px bg-slate-200" />
                  )}

                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center shadow-sm`}>
                    <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-medium text-slate-800">
                      Ein Administrator {activityText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">
                        {getRelativeTime(item.created_at)}
                      </p>
                      <span className="text-slate-300">•</span>
                      <p className="text-xs text-slate-400">
                        {humanizeDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
