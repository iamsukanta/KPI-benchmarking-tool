"use client";

import { useState } from "react";
import RequireAuth from "@/components/require-auth";
import Sidebar from '@/app/(dashboard)/sidebar';
import ForcedPasswordChange from "@/app/(dashboard)/_components/forced-password-change";
import { useAuth } from "@/context/auth-context";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChevronDown,
  faUser,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

export default function Main({
  children
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (user?.change_password_at_first_login) {
    return (
      <RequireAuth>
        <ForcedPasswordChange />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="h-screen overflow-hidden bg-slate-100">
        <div className="flex h-full">
          <Sidebar sidebarOpen={sidebarOpen} />

          <div
            className={`
            flex-1 flex flex-col
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "ml-64" : "ml-0"}
            lg:ml-0
          `}
          >
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-6 sticky top-0 z-30 shadow-sm">
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="lg:hidden p-2 mr-4 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-slate-700" />
              </button>

              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold text-brand-600">
                    Himmlische Herbergen
                  </h1>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user?.role.split('_').join(' ')}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {profileOpen && (
                    <>
                      {/* Backdrop for mobile */}
                      <div
                        className="fixed inset-0 z-40 lg:hidden"
                        onClick={() => setProfileOpen(false)}
                      />

                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/60 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm">
                        {/* User info section */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
                            onClick={() => setProfileOpen(false)}
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors"
                            />
                            <span className="font-medium">Profil</span>
                          </Link>

                          <button
                            type="button"
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer group"
                          >
                            <FontAwesomeIcon
                              icon={faRightFromBracket}
                              className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors"
                            />
                            <span className="font-medium">Abmelden</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 space-y-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
