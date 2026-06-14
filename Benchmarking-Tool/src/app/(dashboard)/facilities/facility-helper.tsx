"use client";

import { destroyFacility, detachUser } from "@/lib/api/facilities";
import { Facility } from "@/lib/types/facilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faBuilding,
  faDoorOpen,
  faBed,
  faTag,
  faUser,
  faCheckCircle,
  faXmarkCircle,
  faPenToSquare,
  faTrashCan,
  faEye,
  faChevronDown,
  faChevronUp,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";

interface Props {
  initialFacilities: Facility[];
  isAdmin: boolean;
}

interface GroupedData {
  federation: Facility;
  facilities: Facility[];
}

export default function FacilityHelper({ initialFacilities, isAdmin }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");

  async function onDelete(id: number) {
    try {
      const res = await destroyFacility(id.toString());
      if (res.status !== "success") {
        setError(res.message);
      } else {
        setFacilities((prev) => prev.filter((f) => f.id !== id));
        setError(undefined);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    }
  }

  async function removeFromManagedBy(id: number) {
    if (!confirm("Sind Sie sicher, dass Sie diesen Benutzer von dieser Einrichtung trennen möchten?")) return;
    try {
      setError(undefined);
      const res = await detachUser(id);
      if (res.status !== "success") {
        setError(res.message);
      } else {
        const newFacilities = facilities.map((facility) =>
          facility.id === id
            ? { ...facility, user: "", user_name: "" }
            : facility
        );
        setFacilities(newFacilities);
        setSuccess("Der Benutzer wurde entfernt.");
        setTimeout(() => setSuccess(undefined), 3500);
      }
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Unbekannter Fehler.");
    }
  }

  // Filtered facilities based on search query
  const filteredFacilities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.category_name?.toLowerCase().includes(q) ||
        f.user_name?.toLowerCase().includes(q) ||
        f.federation_name?.toLowerCase().includes(q)
    );
  }, [facilities, search]);

  const federations = filteredFacilities.filter((f) => f.is_federation);
  const grouped: GroupedData[] = federations.map((fed) => ({
    federation: fed,
    // When searching, also include children whose parent federation matched the query
    facilities: filteredFacilities.filter(
      (f) => !f.is_federation && f.federation?.toString() === fed.id.toString()
    ),
  }));

  // Include facilities whose federation is NOT in the filtered list but themselves matched
  const groupedChildIds = new Set(grouped.flatMap((g) => g.facilities.map((f) => f.id)));
  const federationIds = new Set(federations.map((f) => f.id));

  // Facilities that match search but belong to a federation that didn't match — promote them
  const orphanedMatches = search.trim()
    ? filteredFacilities.filter(
        (f) =>
          !f.is_federation &&
          f.federation != null &&
          f.federation !== "" &&
          !federationIds.has(Number(f.federation)) &&
          !groupedChildIds.has(f.id)
      )
    : [];

  const unaffiliated = filteredFacilities.filter((f) => !f.is_federation && !f.federation);

  const federationManagerGroups = Object.values(
    filteredFacilities
      .filter((f) => f.federation != null && f.federation !== "" && f.federation_name)
      .reduce<Record<number, { id: number; name: string; user?: string; facilities: Facility[] }>>(
        (acc, f) => {
          const fedId = Number(f.federation);
          if (!acc[fedId]) {
            // Find the actual federation facility to get its user field
            const fedFacility = facilities.find((fed) => fed.id === fedId);
            acc[fedId] = {
              id: fedId,
              name: f.federation_name!,
              user: fedFacility?.user,
              facilities: [],
            };
          }
          acc[fedId].facilities.push(f);
          return acc;
        },
        {}
      )
  );

  // Fix: exclude federation items from unaffiliated section for managers
  const unaffiliatedForManager = filteredFacilities.filter((f) => !f.federation && !f.is_federation);

  const totalResults = filteredFacilities.length;
  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Einrichtungen, Verbände oder Verwalter suchen…"
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white shadow-sm
                text-sm text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                transition-all"
            />
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSearching && (
            <p className="text-sm text-slate-500 -mt-2">
              <span className="font-semibold text-slate-700">{totalResults}</span>{" "}
              {totalResults === 1 ? "Ergebnis" : "Ergebnisse"} für{" "}
              <span className="font-semibold text-brand-600">„{search.trim()}"</span>
            </p>
          )}
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(undefined)}
            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Erfolg</h3>
            <p className="text-sm text-green-600 mt-1">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(undefined)}
            className="text-green-400 hover:text-green-600 transition-colors"
            aria-label="Dismiss success"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {isAdmin && (
        <>
          {grouped.map(({ federation, facilities: children }) => (
            <FederationGroup
              key={`fed-${federation.id}`}
              federation={federation}
              facilities={children}
              isAdmin={isAdmin}
              onDelete={onDelete}
              removeUser={removeFromManagedBy}
              defaultExpanded={isSearching}
            />
          ))}

          {orphanedMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Suchergebnisse aus Verbänden
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {orphanedMatches.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {orphanedMatches.map((item) => (
                  <FacilityCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onDelete={onDelete}
                    removeUser={removeFromManagedBy}
                  />
                ))}
              </div>
            </div>
          )}

          {unaffiliated.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Unabhängige Einrichtungen
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {unaffiliated.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {unaffiliated.map((item) => (
                  <FacilityCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onDelete={onDelete}
                    removeUser={removeFromManagedBy}
                  />
                ))}
              </div>
            </div>
          )}

          {grouped.length === 0 && unaffiliated.length === 0 && filteredFacilities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFacilities.map((item) => (
                <FacilityCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  removeUser={removeFromManagedBy}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!isAdmin && (
        <>
          {federationManagerGroups.map(({ id, name, user, facilities: children }) => (
            <FederationGroup
              key={`fed-${id}`}
              federation={{ id, name, user, is_federation: true } as Facility}
              facilities={children}
              isAdmin={false}
              onDelete={onDelete}
              removeUser={removeFromManagedBy}
              defaultExpanded={isSearching}
            />
          ))}

          {unaffiliatedForManager.length > 0 && (
            <div className="space-y-3">
              {federationManagerGroups.length > 0 && (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Unabhängige Einrichtungen
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {unaffiliatedForManager.length}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {unaffiliatedForManager.map((item) => (
                  <FacilityCard
                    key={item.id}
                    item={item}
                    isAdmin={false}
                    onDelete={onDelete}
                    removeUser={removeFromManagedBy}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={isSearching ? faMagnifyingGlass : faBuilding}
                className="w-9 h-9 text-slate-400"
              />
            </div>
            {isSearching ? (
              <>
                <p className="text-base font-semibold text-slate-700">Keine Ergebnisse gefunden</p>
                <p className="text-sm text-slate-500 mt-1">
                  Keine Einrichtungen entsprechen{" "}
                  <span className="font-medium text-slate-700">„{search.trim()}"</span>
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600
                  text-white text-sm font-semibold hover:bg-brand-700 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                  Suche zurücksetzen
                </button>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-slate-700">Keine Einrichtungen gefunden</p>
                <p className="text-sm text-slate-500 mt-1">
                  Beginnen Sie, indem Sie Ihre erste Einrichtung hinzufügen
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FederationGroup({
  federation,
  facilities,
  isAdmin,
  onDelete,
  removeUser,
  defaultExpanded = false,
}: {
  federation: Facility;
  facilities: Facility[];
  isAdmin: boolean;
  onDelete: (id: number) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  defaultExpanded?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Auto-expand when a search is active so results are visible
  const isExpanded = defaultExpanded ? true : !collapsed;

  // Show edit button in header if the current user is the federation manager
  const isOwnFederation = !isAdmin && user?.id === federation.user;

  return (
    <div className="rounded-xl border border-brand-200 shadow-sm">
      <div className="bg-gradient-to-r from-brand-50 to-brand-50 border-b border-brand-200 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-brand-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-800 truncate">{federation.name}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                  Föderation
                </span>
                {isAdmin && (
                  federation.is_user_approved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" /> Genehmigt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <FontAwesomeIcon icon={faXmarkCircle} className="w-3 h-3" /> Ausstehend
                    </span>
                  )
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-xs text-slate-500">
                  {facilities.length === 0
                    ? "No facilities assigned yet"
                    : `${facilities.length} ${facilities.length === 1 ? "facility" : "facilities"}`}
                </p>
                {federation.user_name && (
                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium text-slate-600">{federation.user_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <>
                <Link
                  href={`/facilities/${federation.id}/update`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
                  bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all shadow-sm"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-3 h-3" />
                  Bearbeiten
                </Link>
                <button
                  onClick={() => onDelete(federation.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200
                  bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-all shadow-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                  Löschen
                </button>
              </>
            )}
            {isOwnFederation && (
              <Link
                href={`/facilities/${federation.id}/update`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
                bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-3 h-3" />
                Bearbeiten
              </Link>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200
              bg-white text-slate-500 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/60 p-5">
          {facilities.length === 0 ? (
            <div className="text-center py-8 rounded-lg border border-dashed border-slate-300 bg-white">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faDoorOpen} className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Noch keine Einrichtungen</p>
              <p className="text-xs text-slate-400 mt-1">
                Dieser Verband verfügt über keine zugewiesenen Einrichtungen
              </p>
              {isAdmin && (
                <Link
                  href="/facilities/create"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600
                  text-white text-xs font-semibold hover:bg-brand-700 transition-all"
                >
                  Einrichtung hinzufügen
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((item) => (
                <FacilityCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  removeUser={removeUser}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FacilityCard({
  item,
  isAdmin,
  onDelete,
  removeUser,
}: {
  item: Facility;
  isAdmin: boolean;
  onDelete: (id: number) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
}) {
  const { user } = useAuth();

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors flex-1 min-w-0">
            {item.name}
          </h3>
          {isAdmin && (
            item.is_user_approved ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                <span className="text-xs font-semibold">Genehmigt</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex-shrink-0">
                <FontAwesomeIcon icon={faXmarkCircle} className="w-3 h-3" />
                <span className="text-xs font-semibold">Ausstehend</span>
              </div>
            )
          )}
        </div>
        {item.category_name && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
          <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
          <span className="text-xs font-medium">{item.category_name}</span>
        </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faDoorOpen} className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Zimmer</p>
              <p className="text-sm font-bold text-slate-800">{item.rooms}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBed} className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Betten</p>
              <p className="text-sm font-bold text-slate-800">{item.beds}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 font-medium">Verwaltet von</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{item.user_name}</p>
          </div>
          {isAdmin && item.user && (
            <FontAwesomeIcon
              className="text-red-700 hover:text-red-500 cursor-pointer"
              icon={faXmark}
              onClick={() => removeUser(item.id)}
            />
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        {isAdmin ? (
          <>
            <Link
              href={`/facilities/${item.id}/update`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
              border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50
              hover:border-slate-300 transition-all shadow-sm"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
              Bearbeiten
            </Link>
            <button
              onClick={() => onDelete(item.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
              border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50
              hover:border-red-300 transition-all shadow-sm cursor-pointer"
            >
              <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
              Löschen
            </button>
          </>
        ) : (
          <>
            {user?.id === item.user && (
              <Link
                href={`/facilities/${item.id}/update`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
                border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50
                hover:border-slate-300 transition-all shadow-sm"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                Bearbeiten
              </Link>
            )}
            <Link
              href={`/facilities/${item.id}/detail`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm"
            >
              <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
              Jahresdaten Ansehen
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
