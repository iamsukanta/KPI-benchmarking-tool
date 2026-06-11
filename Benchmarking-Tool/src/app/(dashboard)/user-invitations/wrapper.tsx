"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faPaperPlane, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { UserInvitation } from "@/lib/types/user-invitations";
import {
  sendInvitationAction,
  resendInvitationAction,
  deleteInvitationAction,
  fetchInvitationsAction,
} from "./actions";

interface Props {
  initialInvitations: UserInvitation[];
}

export default function UserInvitationWrapper({ initialInvitations }: Props) {
  const [userInvitations, setUserInvitations] = useState<UserInvitation[]>(initialInvitations);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearMessages() {
    setSuccess(null);
    setError(null);
  }

  async function sendInvitation(formData: FormData) {
    clearMessages();
    setEmailError(null);
    setIsSending(true);
    try {
      const result = await sendInvitationAction(formData);
      if (result.status === "success") {
        setSuccess(result.message);
        (document.getElementById("invite-form") as HTMLFormElement)?.reset();
        const updated = await fetchInvitationsAction();
        setUserInvitations(updated);
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setEmailError(result.errors.email?.[0] ?? "Unbekannter Fehler.");
      }
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Einladung konnte nicht gesendet werden.");
      setTimeout(() => setError(null), 3500);
    } finally {
      setIsSending(false);
    }
  }

  async function resendInvitation(invitationId: number) {
    clearMessages();
    setProcessingId(invitationId);
    try {
      const { status, message } = await resendInvitationAction(invitationId);
      if (status === "success") {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 3500);
      }
      else {
        setError(message);
        setTimeout(() => setError(null), 3500);
      }
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Einladung konnte nicht erneut gesendet werden.");
      setTimeout(() => setError(null), 3500);
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteInvitation(invitationId: number) {
    clearMessages();
    setProcessingId(invitationId);
    try {
      const { status, message } = await deleteInvitationAction(invitationId);
      if (status === "success") {
        setSuccess(message);
        setUserInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
        const updated = await fetchInvitationsAction();
        setUserInvitations(updated);
      } else {
        setError(message);
      }
    } catch {
      setError("Einladung konnte nicht gelöscht werden.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800">Erfolg</h3>
            <p className="text-sm text-green-600 mt-1">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-600 transition-colors cursor-pointer"
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
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
            aria-label="Fehler verwerfen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form id="invite-form" action={sendInvitation}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Neue Einladung senden</h2>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <input
                type="email"
                name="email"
                placeholder="E-Mail-Adresse"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-brand-500 transition
                  ${emailError ? "border-red-400" : "border-slate-200 bg-white"}`}
              />
              {emailError && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                  {emailError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-600 text-white
                text-sm font-medium hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-400
                disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex-shrink-0"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
              )}
              <span>Einladen</span>
            </button>
          </div>
        </div>
      </form>

      {/* Invitation list */}
      <div className="space-y-4">
        {userInvitations.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Keine ausstehenden Einladungen.</p>
        )}
        {userInvitations.map((userInvitation) => {
          const isProcessing = processingId === userInvitation.id;

          return (
            <div
              key={userInvitation.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md
                hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 mb-1">
                      <span className="font-semibold text-slate-800">{userInvitation.email}</span>
                    </p>
                    <p className={`text-xs ${userInvitation.is_expired ? "text-red-500" : "text-slate-400"}`}>
                      {userInvitation.is_expired ? "Abgelaufen" : `Läuft ab: ${new Date(userInvitation.expires_at).toLocaleDateString("de-DE")}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => resendInvitation(userInvitation.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-light
                        text-sm font-medium hover:bg-brand-100 active:bg-brand-100 disabled:bg-brand-100
                        disabled:cursor-not-allowed transition-all shadow-sm hover:shadow cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
                      )}
                      <span>Erneut senden</span>
                    </button>
                    <button
                      onClick={() => deleteInvitation(userInvitation.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
                        border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300
                        active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                      )}
                      <span>Löschen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
