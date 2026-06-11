"use client";

import { useState, useEffect } from "react";
import { joiningRequests, approveUser, detachUser } from "@/lib/api/facilities";
import { Facility } from "@/lib/types/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faBuilding,
  faUserTie,
  faUsers,
  faArrowRight,
  faCheck,
  faXmark,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function JoiningRequestTable() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { results } = await joiningRequests();
        setFacilities(results);
      } catch {
        setError("Failed to load joining requests");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onDelete(id: number) {
    try {
      setProcessingId(id);
      setError(undefined);
      const res = await detachUser(id);
      if (res.status !== 'success') {
        setError(res.message);
      } else {
        const newFacilities = [...facilities].filter(fac => fac.id !== id);
        setFacilities(newFacilities);
        setSuccess("Die Anfrage wurde erfolgreich abgelehnt.");
        setTimeout(() => setSuccess(undefined), 3500);
      }
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Unbekannter Fehler.");
    } finally {
      setProcessingId(null);
    }
  }

  async function onApprove(id: number) {
    try {
      setProcessingId(id);
      setError(undefined);
      const { status, message } = await approveUser(id);
      if (status !== 'success') {
        setError(message);
      } else {
        const newFacilities = [...facilities].filter(fac => fac.id !== id);
        setFacilities(newFacilities);
        setSuccess(message);
        setTimeout(() => setSuccess(undefined), 3500);
      }
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Unbekannter Fehler.");
    } finally {
      setProcessingId(null);
    }
  }

  function getRoleIcon(role: string) {
    return role === "facility_manager" ? faUserTie : faUsers;
  }

  function getRoleColor(role: string) {
    return role === "facility_manager"
      ? { bg: 'bg-brand-100', text: 'text-brand-700', icon: 'text-brand-600' }
      : { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600' };
  }

  function formatRole(role: string) {
    return role === "facility_manager" ? 'Facility Manager' : 'Federation Manager';
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Erfolg</h3>
            <p className="text-sm text-green-600 mt-1">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(undefined)}
            className="text-green-400 hover:text-green-600 transition-colors"
            aria-label="Erfolg verwerfen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Fehler</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(undefined)}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Fehler verwerfen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {facilities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserPlus} className="w-9 h-9 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">Keine ausstehenden Anfragen</p>
            <p className="text-sm text-slate-500 mt-1">Alle Beitrittsanfragen wurden bearbeitet</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {facilities.map(facility => {
            const roleColors = getRoleColor(facility.user_facility_role as string);
            const roleIcon = getRoleIcon(facility.user_facility_role as string);
            const isProcessing = processingId === facility.id;

            return (
              <div
                key={facility.id}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-full ${roleColors.bg} flex items-center justify-center shadow-sm`}>
                      <FontAwesomeIcon icon={roleIcon} className={`w-5 h-5 ${roleColors.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-semibold text-slate-800">{facility.user_name}</span>
                        {' '}möchte beitreten als{' '}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.bg} ${roleColors.text}`}>
                          {formatRole(facility.user_facility_role as string)}
                        </span>
                      </p>

                      <Link
                        href={`/facilities/${facility.id}/update`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors group/link"
                      >
                        <FontAwesomeIcon icon={faBuilding} className="w-3 h-3" />
                        <span className="group-hover/link:underline">{facility.name}</span>
                        <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onApprove(facility.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600
                        text-white text-sm font-medium hover:bg-green-700 active:bg-green-800 disabled:bg-green-400
                        disabled:cursor-not-allowed transition-all shadow-sm hover:shadow cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent
                          rounded-full animate-spin"></div>
                        ) : (
                          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                        )}
                        <span>Genehmigen</span>
                      </button>
                      <button
                        onClick={() => onDelete(facility.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
                        border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300
                        active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all shadow-sm cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent
                          rounded-full animate-spin"></div>
                        ) : (
                          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                        )}
                        <span>Abfall</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
