"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faDatabase,
  faLayerGroup,
  faBuilding,
  faChartBar,
  faUserCheck,
  faChevronDown,
  faChevronRight,
  faCloudArrowUp,
  faUserPlus,
  faBuildingUser
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const dataRoutes = [
    "/categories",
    "/facilities",
    "/master-data"
  ];
  const benchmarkRoutes = [
    "/internal-benchmark",
    "/category-benchmark"
  ];

  const isDataRouteActive = dataRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isBenchmarkRouteActive = benchmarkRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const [dataOpen, setDataOpen] = useState(isDataRouteActive);
  const [benchmarkOpen, setBenchmarkOpen] = useState(isBenchmarkRouteActive);

  useEffect(() => {
    setDataOpen(isDataRouteActive);
  }, [isDataRouteActive]);

  useEffect(() => {
    setBenchmarkOpen(isBenchmarkRouteActive);
  }, [isBenchmarkRouteActive]);

  const linkClasses = (active: boolean) =>
    `group flex items-center gap-3 px-4 h-11 rounded-lg transition-all duration-200 font-medium ${
      active
        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
    }`;

  const subLinkClasses = (active: boolean) =>
    `group flex items-center gap-3 px-4 h-9 rounded-lg text-sm transition-all duration-200 ${
      active
        ? "bg-amber-500/20 text-amber-400 border-l-2 border-amber-400"
        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:border-l-2 hover:border-slate-600"
    }`;

  return (
    <aside
      className={`
        fixed lg:static z-40
        h-full w-64
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        text-white
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        border-r border-slate-800/50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="h-20 flex items-center justify-center px-6 border-b border-slate-800/50 relative">
        <div className="flex items-center gap-3">
          <div>
            <img src="/hh-logo.png" alt="Himlische Herbergen" className="h-10 w-auto" />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <Link href="/" className={linkClasses(pathname === "/")}>
          <FontAwesomeIcon
            icon={faChartLine}
            className={`w-4 h-4 ${pathname === "/" ? "text-white" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
          />
          <span>Armaturenbrett</span>
        </Link>

        {user?.role === "admin" ? (
          <div className="space-y-1">
            <button
              onClick={() => setDataOpen(!dataOpen)}
              className={`group w-full flex items-center justify-between px-4 h-11 rounded-lg transition-all
              duration-200 font-medium cursor-pointer ${isDataRouteActive
                ? "bg-slate-800/60 text-white"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faDatabase}
                  className={`w-4 h-4 ${isDataRouteActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
                />
                <span>Daten</span>
              </div>
              <FontAwesomeIcon
                icon={dataOpen ? faChevronDown : faChevronRight}
                className="w-3 h-3 text-slate-400 transition-transform duration-200"
              />
            </button>

            <div
              className={`ml-3 pl-4 border-l border-slate-800/50 space-y-1 transition-all duration-300 overflow-hidden ${dataOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <Link
                href="/categories"
                className={subLinkClasses(pathname.startsWith("/categories"))}
              >
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className={`w-3.5 h-3.5 ${pathname.startsWith("/categories") ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                />
                <span>Kategorien</span>
              </Link>

              <Link
                href="/facilities"
                className={subLinkClasses(pathname.startsWith("/facilities"))}
              >
                <FontAwesomeIcon
                  icon={faBuilding}
                  className={`w-3.5 h-3.5 ${pathname.startsWith("/facilities") ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                />
                <span>Einrichtungen</span>
              </Link>

              <Link
                href="/master-data"
                className={subLinkClasses(pathname.startsWith("/master-data"))}
              >
                <FontAwesomeIcon
                  icon={faCloudArrowUp}
                  className={`w-3.5 h-3.5 ${pathname.startsWith("/master-data") ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                />
                <span>Daten-Upload</span>
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/facilities"
            className={linkClasses(pathname.startsWith("/facilities"))}
          >
            <FontAwesomeIcon
              icon={faBuilding}
              className={`w-3.5 h-3.5 ${pathname.startsWith("/facilities") ? "text-white" : "text-slate-500 group-hover:text-amber-400"} transition-colors`}
            />
            <span>Einrichtungen</span>
          </Link>
        )}

        {user?.role === "federation_manager" && (
          <div className="space-y-1">
            <button
              onClick={() => setBenchmarkOpen(!benchmarkOpen)}
              className={`group w-full flex items-center justify-between px-4 h-11 rounded-lg transition-all
              duration-200 font-medium cursor-pointer ${isBenchmarkRouteActive
                ? "bg-slate-800/60 text-white"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faDatabase}
                  className={`w-4 h-4 ${isBenchmarkRouteActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
                />
                <span>Benchmark</span>
              </div>
              <FontAwesomeIcon
                icon={benchmarkOpen ? faChevronDown : faChevronRight}
                className="w-3 h-3 text-slate-400 transition-transform duration-200"
              />
            </button>

            <div
              className={`ml-3 pl-4 border-l border-slate-800/50 space-y-1 transition-all duration-300 overflow-hidden ${benchmarkOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <Link
                href="/internal-benchmark"
                className={subLinkClasses(pathname.startsWith("/internal-benchmark"))}
              >
                <FontAwesomeIcon
                  icon={faChartBar}
                  className={`w-3.5 h-3.5 ${pathname.startsWith("/internal-benchmark") ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                />
                <span>Interner Benchmark</span>
              </Link>

              <Link
                href="/category-benchmark"
                className={subLinkClasses(
                  pathname === "/category-benchmark"
                )}
              >
                <FontAwesomeIcon
                  icon={faChartBar}
                  className={`w-3.5 h-3.5 ${pathname === "/category-benchmark" ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                />
                <span>Kategorieweiter Benchmark</span>
              </Link>
            </div>
          </div>
        )}

        {user?.role === "facility_manager" && (
          <Link
            href="/category-benchmark"
            className={linkClasses(pathname.startsWith("/category-benchmark"))}
          >
            <FontAwesomeIcon
              icon={faChartBar}
              className={`w-3.5 h-3.5 ${pathname.startsWith("/category-benchmark") ? "text-white" : "text-slate-500 group-hover:text-amber-400"} transition-colors`}
            />
            <span>Benchmark</span>
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link
              href="/all-facilities"
              className={linkClasses(
                pathname === "/all-facilities"
              )}
            >
              <FontAwesomeIcon
                icon={faBuildingUser}
                className={`w-4 h-4 ${pathname === "/all-facilities" ? "text-white" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
              />
              <span>Alle Einrichtungen &amp; Föderation</span>
            </Link>

            <Link
              href="/joining-requests"
              className={linkClasses(
                pathname === "/joining-requests"
              )}
            >
              <FontAwesomeIcon
                icon={faUserCheck}
                className={`w-4 h-4 ${pathname === "/joining-requests" ? "text-white" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
              />
              <span>Beitrittsanfragen</span>
            </Link>

            <Link
              href="/user-invitations"
              className={linkClasses(
                pathname === "/user-invitations"
              )}
            >
              <FontAwesomeIcon
                icon={faUserPlus}
                className={`w-4 h-4 ${pathname === "/user-invitations" ? "text-white" : "text-slate-400 group-hover:text-amber-400"} transition-colors`}
              />
              <span>Benutzereinladungen</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
