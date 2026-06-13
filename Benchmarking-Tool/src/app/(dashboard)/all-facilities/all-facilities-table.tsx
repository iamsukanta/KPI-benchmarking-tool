"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Facility } from "@/lib/types/facilities";
import { destroyFacility, sendFacilityCredentials } from "@/lib/api/facilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSort,
  faSortUp,
  faSortDown,
  faEye,
  faPenToSquare,
  faTrashCan,
  faPaperPlane,
  faCheckCircle,
  faXmarkCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faBuilding,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

type SortKey =
  | "name"
  | "user_name"
  | "is_active"
  | "category_name"
  | "federation_name"
  | "is_user_approved";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 30;

interface Props {
  initialFacilities: Facility[];
}

function sortValue(facility: Facility, key: SortKey): string | number {
  switch (key) {
    case "name":
      return facility.name?.toLowerCase() ?? "";
    case "user_name":
      return facility.user_name?.toLowerCase() ?? "";
    case "is_active":
      return facility.is_active ? 1 : 0;
    case "category_name":
      return facility.category_name?.toLowerCase() ?? "";
    case "federation_name":
      return (facility.is_federation ? "föderation" : facility.federation_name?.toLowerCase()) ?? "";
    case "is_user_approved":
      return facility.is_user_approved ? 1 : 0;
  }
}

export default function AllFacilitiesTable({ initialFacilities }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const [success, setSuccess] = useState<string>();
  const [error, setError] = useState<string>();

  const [viewFacility, setViewFacility] = useState<Facility | null>(null);
  const [deleteFacility, setDeleteFacility] = useState<Facility | null>(null);
  const [credentialFacility, setCredentialFacility] = useState<Facility | null>(null);
  const [processing, setProcessing] = useState(false);

  function flashSuccess(message: string) {
    setSuccess(message);
    setError(undefined);
    setTimeout(() => setSuccess(undefined), 4000);
  }

  function toggleSort(key: SortKey) {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visibleFacilities = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? facilities.filter(
          (f) =>
            f.name?.toLowerCase().includes(q) ||
            f.federation_name?.toLowerCase().includes(q) ||
            f.category_name?.toLowerCase().includes(q) ||
            f.user_name?.toLowerCase().includes(q)
        )
      : facilities;

    const sorted = [...filtered].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "de");
      return sortDir === "asc" ? result : -result;
    });
    return sorted;
  }, [facilities, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visibleFacilities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedFacilities = useMemo(
    () => visibleFacilities.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [visibleFacilities, currentPage]
  );

  async function onConfirmDelete() {
    if (!deleteFacility) return;
    try {
      setProcessing(true);
      const res = await destroyFacility(deleteFacility.id.toString());
      if (res.status !== "success") {
        setError(res.message ?? "Löschen fehlgeschlagen.");
      } else {
        setFacilities((prev) => prev.filter((f) => f.id !== deleteFacility.id));
        flashSuccess("Die Einrichtung wurde erfolgreich gelöscht.");
      }
      setDeleteFacility(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setDeleteFacility(null);
    } finally {
      setProcessing(false);
    }
  }

  async function onSendCredentials(name: string, email: string) {
    if (!credentialFacility) return;
    const target = credentialFacility;
    try {
      setProcessing(true);
      const res = await sendFacilityCredentials({
        id: target.id,
        name,
        email,
        is_federation: target.is_federation ?? false
      });
      if (res.status !== "success") {
        setSuccess(undefined);
        setError(res.message ?? "Versand fehlgeschlagen.");
      } else {
        flashSuccess(res.message ?? "Die Zugangsdaten wurden erfolgreich versendet.");
      }
    } catch (err: unknown) {
      setSuccess(undefined);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setCredentialFacility(null);
      setProcessing(false);
    }
  }

  const isSearching = search.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Nach Einrichtung, Föderation, Kategorie oder Verwalter suchen…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white shadow-sm
            text-sm text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
        />
        {isSearching && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Suche zurücksetzen"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        )}
      </div>

      {success && (
        <Banner
          tone="success"
          icon={faCheckCircle}
          title="Erfolg"
          message={success}
          onClose={() => setSuccess(undefined)}
        />
      )}
      {error && (
        <Banner
          tone="error"
          icon={faExclamationCircle}
          title="Fehler"
          message={error}
          onClose={() => setError(undefined)}
        />
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SortableHeader label="Einrichtung" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHeader label="Verwaltet von" sortKey="user_name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHeader label="Status" sortKey="is_active" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHeader label="Kategorie" sortKey="category_name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHeader label="Föderation" sortKey="federation_name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHeader label="Freigegeben" sortKey="is_user_approved" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedFacilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{facility.name}</span>
                      {facility.is_federation && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-700">
                          Föderation
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {facility.user_name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {facility.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                        Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {facility.category_name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {facility.is_federation
                      ? <span className="text-slate-400">—</span>
                      : facility.federation_name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {facility.is_user_approved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" /> true
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <FontAwesomeIcon icon={faXmarkCircle} className="w-3 h-3" /> false
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {!facility.is_user_approved && (
                        <ActionButton
                          icon={faPaperPlane}
                          label="Zugangsdaten senden"
                          tone="brand"
                          onClick={() => setCredentialFacility(facility)}
                        />
                      )}
                      <ActionButton
                        icon={faEye}
                        label="Ansehen"
                        tone="slate"
                        onClick={() => setViewFacility(facility)}
                      />
                      <Link
                        href={`/facilities/${facility.id}/update`}
                        title="Bearbeiten"
                        aria-label="Bearbeiten"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200
                          bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                      </Link>
                      <ActionButton
                        icon={faTrashCan}
                        label="Löschen"
                        tone="red"
                        onClick={() => setDeleteFacility(facility)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleFacilities.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={isSearching ? faMagnifyingGlass : faBuilding}
                className="w-9 h-9 text-slate-400"
              />
            </div>
            <p className="text-base font-semibold text-slate-700">
              {isSearching ? "Keine Ergebnisse gefunden" : "Keine Einrichtungen vorhanden"}
            </p>
            {isSearching && (
              <p className="text-sm text-slate-500 mt-1">
                Keine Einträge entsprechen <span className="font-medium text-slate-700">„{search.trim()}"</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {visibleFacilities.length === 0 ? (
            "0 Einträge"
          ) : (
            <>
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, visibleFacilities.length)} von{" "}
              {visibleFacilities.length} {visibleFacilities.length === 1 ? "Eintrag" : "Einträge"}
            </>
          )}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600
                hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Zurück
            </button>
            <span className="px-3 text-sm text-slate-600">
              Seite <span className="font-semibold text-slate-800">{currentPage}</span> von {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600
                hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Weiter
            </button>
          </div>
        )}
      </div>

      {viewFacility && (
        <ViewModal facility={viewFacility} onClose={() => setViewFacility(null)} />
      )}

      {deleteFacility && (
        <DeleteModal
          facility={deleteFacility}
          processing={processing}
          onCancel={() => setDeleteFacility(null)}
          onConfirm={onConfirmDelete}
        />
      )}

      {credentialFacility && (
        <CredentialsModal
          facility={credentialFacility}
          processing={processing}
          onCancel={() => setCredentialFacility(null)}
          onSubmit={onSendCredentials}
        />
      )}
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 uppercase tracking-wider hover:text-slate-700 transition-colors cursor-pointer"
      >
        {label}
        <FontAwesomeIcon
          icon={!active ? faSort : dir === "asc" ? faSortUp : faSortDown}
          className={`w-3 h-3 ${active ? "text-brand-600" : "text-slate-300"}`}
        />
      </button>
    </th>
  );
}

function ActionButton({
  icon,
  label,
  tone,
  onClick
}: {
  icon: typeof faEye;
  label: string;
  tone: "brand" | "slate" | "red";
  onClick: () => void;
}) {
  const toneClasses =
    tone === "brand"
      ? "border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-300"
      : tone === "red"
        ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border bg-white transition-all cursor-pointer ${toneClasses}`}
    >
      <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
    </button>
  );
}

function Banner({
  tone,
  icon,
  title,
  message,
  onClose
}: {
  tone: "success" | "error";
  icon: typeof faCheckCircle;
  title: string;
  message: string;
  onClose: () => void;
}) {
  const styles =
    tone === "success"
      ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", title: "text-green-800", text: "text-green-600", close: "text-green-400 hover:text-green-600" }
      : { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", title: "text-red-800", text: "text-red-600", close: "text-red-400 hover:text-red-600" };
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex items-start gap-3 shadow-sm`}>
      <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        <h3 className={`text-sm font-semibold ${styles.title}`}>{title}</h3>
        <p className={`text-sm ${styles.text} mt-1`}>{message}</p>
      </div>
      <button onClick={onClose} className={`${styles.close} transition-colors cursor-pointer`} aria-label="Schließen">
        <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
      </button>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg"
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            aria-label="Schließen"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ViewModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Name", value: facility.name },
    { label: "Typ", value: facility.is_federation ? "Föderation" : "Einrichtung" },
    { label: "Verwaltet von", value: facility.user_name || "—" },
    { label: "Verwaltet von E-Mail", value: facility.user_email || "-" },
    { label: "Status", value: facility.is_active ? "Aktiv" : "Inaktiv" },
    { label: "Benutzer freigegeben", value: facility.is_user_approved ? "true" : "false" },
    { label: "Kategorie", value: facility.category_name || "—" },
    { label: "Region", value: facility.region || "—" },
    { label: "Föderation", value: facility.is_federation ? "—" : facility.federation_name || "—" }
  ];

  if (!facility.is_federation) {
    rows.push(
      { label: "Zimmer", value: facility.rooms ?? "—" },
      { label: "Betten", value: facility.beds ?? "—" }
    );
  }

  rows.push(
    { label: "Öffnungstage pro Jahr", value: facility.opening_days_per_year || "—" },
    { label: "Betriebsgebäudefläche", value: facility.operational_building_area || "—" },
    { label: "Gesamtgrundstücksfläche", value: facility.total_property_area || "—" },
    { label: "Bundesweit", value: facility.federal_state ? "Ja" : "Nein" }
  );

  return (
    <ModalShell title="Einrichtungsdetails" onClose={onClose}>
      <div className="px-6 py-5 overflow-y-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
              <dd className="text-sm font-semibold text-slate-800 mt-0.5 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
        <Link
          href={`/facilities/${facility.id}/update`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
          Bearbeiten
        </Link>
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer"
        >
          Schließen
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteModal({
  facility,
  processing,
  onCancel,
  onConfirm
}: {
  facility: Facility;
  processing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title="Einrichtung löschen" onClose={onCancel} maxWidth="max-w-md">
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-700">
              Sind Sie sicher, dass Sie{" "}
              <span className="font-semibold text-slate-900">{facility.name}</span> löschen möchten?
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Daten werden dauerhaft entfernt.
            </p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={processing}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          onClick={onConfirm}
          disabled={processing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all cursor-pointer disabled:opacity-60"
        >
          {processing && <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />}
          Löschen
        </button>
      </div>
    </ModalShell>
  );
}

function CredentialsModal({
  facility,
  processing,
  onCancel,
  onSubmit
}: {
  facility: Facility;
  processing: boolean;
  onCancel: () => void;
  onSubmit: (name: string, email: string) => void;
}) {
  const [name, setName] = useState(facility.user_name ?? "");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const nameError = touched && !name.trim() ? "Name ist erforderlich." : undefined;
  const emailError = touched && !email.trim() ? "E-Mail-Adresse ist erforderlich." : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !email.trim()) return;
    onSubmit(name.trim(), email.trim());
  }

  return (
    <ModalShell title="Zugangsdaten senden" onClose={onCancel} maxWidth="max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-500">
            Sendet die Onboarding-E-Mail mit einem temporären Passwort an{" "}
            <span className="font-semibold text-slate-700">{facility.name}</span>.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-800
                focus:outline-none focus:ring-2 transition-all ${
                  nameError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-brand-500 focus:border-brand-500"
                }`}
              placeholder="Vor- und Nachname"
            />
            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-800
                focus:outline-none focus:ring-2 transition-all ${
                  emailError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-brand-500 focus:border-brand-500"
                }`}
              placeholder="name@beispiel.de"
            />
            {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all cursor-pointer disabled:opacity-60"
          >
            {processing
              ? <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
              : <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />}
            Senden
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
