"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { acceptInvitationAction, AcceptInvitationState } from "./actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const initialState: AcceptInvitationState = {};

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
          Arbeiten...
        </span>
      ) : (
        "Einladung annehmen"
      )}
    </button>
  );
}

export default function AcceptInvitationform({ token, email }: { token: string; email: string }) {
  const [state, formAction] = useActionState(acceptInvitationAction, initialState);
  const errors = state.errors ?? {};

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
                  Login
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
    <>
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
              className={inputClass(!!errors.email) + ' disabled:bg-slate-700 disabled:cursor-not-allowed'}
              value={email}
              disabled
            />
          </div>
          <FieldError message={errors.email} />
        </div>

        <input type="hidden" name="token" value={token} />

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
    </>
  );
}
