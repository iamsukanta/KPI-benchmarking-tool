"use client";

import { useActionState, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { signupAction, SignupState } from "@/app/(auth)/signup/actions";
import { getUnapprovedUserFederations } from "@/lib/api/facilities";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faBuilding,
  faSitemap,
  faCheckCircle,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/searchable-select";

type SelectOption = { label: string; value: string };

type Props = {
  facilities: SelectOption[];
};

const initialState: SignupState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700
        text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:from-amber-500 disabled:hover:to-amber-600 mt-2
        active:scale-[0.98] cursor-pointer"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Konto erstellen...
        </span>
      ) : (
        "Benutzerkonto erstellen"
      )}
    </button>
  );
}

export default function SignupForm({ facilities }: Props) {
  const [state, formAction] = useActionState(signupAction, initialState);

  const [facility, setFacility] = useState("");
  const [federation, setFederation] = useState("");
  const [isFederationManager, setIsFederationManager] = useState(false);

  const [federations, setFederations] = useState<SelectOption[] | null>(null);
  const [federationsLoading, setFederationsLoading] = useState(false);

  const fetchedRef = useRef(false);

  const errors = state.errors ?? {};

  async function handleToggle() {
    const next = !isFederationManager;
    setIsFederationManager(next);

    if (next && !fetchedRef.current) {
      fetchedRef.current = true;
      setFederationsLoading(true);
      try {
        const { results } = await getUnapprovedUserFederations();
        setFederations(
          (results ?? []).map((f) => ({
            label: f.name,
            value: f.id.toString(),
          }))
        );
      } catch {
        setFederations([]);
      } finally {
        setFederationsLoading(false);
      }
    }

    if (next) setFacility("");
    else setFederation("");
  }

  if (state.success) {
    return (
      <div className="w-full md:w-1/2 py-10 flex flex-col justify-center items-center">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 text-center shadow-lg shadow-green-500/10">
          <div className="flex justify-center items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-2xl" />
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-400 mt-1">
                Bereit loszulegen?
                <Link
                  href="/login"
                  className="ml-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Anmelden
                </Link>
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-base leading-relaxed mt-4">{state.success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 py-10 flex flex-col justify-center items-center">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          Benutzerkonto erstellen
        </h1>
        <p className="text-base text-slate-400">Melden Sie sich an, um mit VoluLink loszulegen</p>
      </div>

      {errors.form && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 text-center">{errors.form}</p>
        </div>
      )}

      <form className="w-full space-y-6" action={formAction} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="first_name">
              Vorname
            </label>
            <div className="relative group">
              <IconSlot hasError={!!errors.first_name} icon={faUser} />
              <input
                type="text"
                placeholder="John"
                id="first_name"
                name="first_name"
                className={inputClass(!!errors.first_name)}
              />
            </div>
            <FieldError message={errors.first_name} />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="last_name">
              Nachname
            </label>
            <div className="relative group">
              <IconSlot hasError={!!errors.last_name} icon={faUser} />
              <input
                type="text"
                placeholder="Doe"
                id="last_name"
                name="last_name"
                className={inputClass(!!errors.last_name)}
              />
            </div>
            <FieldError message={errors.last_name} />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="email">
            E-Mail-Adresse
          </label>
          <div className="relative group">
            <IconSlot hasError={!!errors.email} icon={faEnvelope} />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className={inputClass(!!errors.email)}
            />
          </div>
          <FieldError message={errors.email} />
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`w-full h-11 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2.5
            transition-all duration-200 cursor-pointer
            ${isFederationManager
              ? "bg-violet-500/15 border-violet-500/50 text-violet-300 shadow-md shadow-violet-500/10"
              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/80"
            }`}
        >
          <span
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200
              ${isFederationManager ? "border-violet-400 bg-violet-400" : "border-slate-500"}`}
          >
            {isFederationManager && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </span>
          <FontAwesomeIcon icon={faShield} className="text-xs" />
          Ich bin ein Föderationsmanager
        </button>

        <input type="hidden" name="is_federation_manager" value={String(isFederationManager)} />
        {/* <input type="hidden" name="facility" value={isFederationManager ? federation : facility} /> */}

        <div
          className={`relative transition-all duration-300 ${isFederationManager
              ? "ring-1 ring-violet-500/30 rounded-xl p-4 bg-violet-500/5"
              : ""
            }`}
        >
          {isFederationManager && (
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faSitemap} className="text-violet-400 text-xs" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                Föderationsmanager
              </span>
            </div>
          )}

          <label className="block mb-2 text-sm font-semibold text-slate-300">
            <FontAwesomeIcon
              icon={isFederationManager ? faSitemap : faBuilding}
              className="mr-2 text-slate-500"
            />
            {isFederationManager ? "Föderation" : "Einrichtung"}
          </label>

          {isFederationManager ? (
            federationsLoading ? (
              <div className="w-full h-12 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-slate-400">Ladeverbände...</span>
              </div>
            ) : (
              <SearchableSelect
                name="facility"
                placeholder="Föderation auswählen..."
                mode="dark"
                options={federations ?? []}
                error={!!errors.facility}
              />
            )
          ) : (
            <SearchableSelect
              name="facility"
              placeholder="Einrichtung auswählen..."
              mode="dark"
              options={facilities}
              error={!!errors.facility}
            />
          )}

          <FieldError message={isFederationManager && errors.facility ? 'Bitte wählen Sie einen Verband aus.' : errors.facility} />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="password">
            Passwort
          </label>
          <div className="relative group">
            <IconSlot hasError={!!errors.password} icon={faLock} />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className={inputClass(!!errors.password)}
            />
          </div>
          <FieldError message={errors.password} />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-300" htmlFor="confirmPassword">
            Passwort bestätigen
          </label>
          <div className="relative group">
            <IconSlot hasError={!!errors.confirmPassword} icon={faLock} />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              className={inputClass(!!errors.confirmPassword)}
            />
          </div>
          <FieldError message={errors.confirmPassword} />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Sie haben bereits ein Konto?
        <Link
          href="/login"
          className="ml-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2"
        >
          Anmelden
        </Link>
      </p>
    </div>
  );
}

function IconSlot({ hasError, icon }: { hasError: boolean; icon: any }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
      <FontAwesomeIcon
        icon={icon}
        className={`${hasError
            ? "text-red-400"
            : "text-slate-500 group-focus-within:text-amber-400"
          } transition-colors duration-200`}
      />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
      {message}
    </p>
  );
}

function inputClass(hasError: boolean) {
  return `w-full pl-11 pr-4 h-12 rounded-lg bg-slate-800/50 text-white placeholder-slate-500
    focus:outline-none focus:ring-2 text-sm transition-all duration-200 border shadow-sm
    hover:bg-slate-800/70 hover:shadow-md ${hasError
      ? "border-red-400/60 focus:ring-red-400/50 focus:border-red-400 shadow-red-500/10"
      : "border-slate-700/50 focus:ring-amber-400/50 focus:border-amber-400 focus:shadow-amber-500/10"
    }`;
}
