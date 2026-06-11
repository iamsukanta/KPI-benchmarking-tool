"use client";

import { useState } from "react";
import ProfileForm from "@/app/(dashboard)/profile/form";
import ChangePasswordForm from '@/app/(dashboard)/profile/change-password-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';

export default function ProfileCard() {
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profileinstellungen</h1>
          <p className="text-sm text-slate-500 mt-0.5">Verwalten Sie Ihre Kontoinformationen und Ihre Sicherheit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-bold text-slate-800">Persönliche Informationen</h2>
            <p className="text-sm text-slate-500 mt-0.5">Aktualisieren sie ihre persönlichen daten</p>
          </div>

          <div className="p-6">
            <ProfileForm />

            {!showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600
                hover:text-brand-700 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faKey} className="w-4 h-4" />
                <span>Kennwort ändern</span>
              </button>
            )}
          </div>
        </div>

        {showChangePassword && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Kennwort ändern</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Aktualisieren Sie Ihr Kontopasswort</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600
                  hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <ChangePasswordForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
