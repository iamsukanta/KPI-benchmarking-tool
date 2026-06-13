"use client";

import { useEffect, useState } from "react";
import { DashboardResult } from "@/lib/types/auth";
import { useAuth } from "@/context/auth-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faBuilding,
  faNetworkWired,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import UserActivities from "@/app/(dashboard)/_components/dashboard/user-activities";
import UserJoinRequests from "@/app/(dashboard)/_components/dashboard/user-join-requests";
import UserApprovals from "@/app/(dashboard)/_components/dashboard/user-approvals";
import StatCard from "@/app/(dashboard)/_components/dashboard/stat-card";
import FacilitySplitChart from "@/app/(dashboard)/_components/dashboard/facility-split-chart";

export default function AdminDashboard({ results }: { results: DashboardResult }) {
  const { user } = useAuth();

  const userActivities = results.user_activities;
  const facilityCount = results.facilities;
  const userJoinRequests = results.user_join_requests || [];
  const userApprovals = results.user_approvals || [];

  const totalAll = facilityCount?.total_facilities_and_federations ?? 0;
  const totalFacilities = facilityCount?.total_facilities ?? 0;
  const totalFederations = facilityCount?.total_federations ?? 0;

  // Render the date on the client only to avoid SSR/CSR hydration mismatches.
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Benchmark-Cockpit</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Willkommen zurück{user?.name ? `, ${user.name}` : ""} — Überblick über Einrichtungen, Föderationen und offene Vorgänge.
          </p>
        </div>
        {today && <p className="text-sm text-slate-400">{today}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={faLayerGroup}
          iconBg="bg-brand-100"
          iconColor="text-brand-600"
          label="Gesamt"
          value={totalAll}
          sub="Einrichtungen & Föderationen"
        />
        <StatCard
          icon={faBuilding}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-600"
          label="Einrichtungen"
          value={totalFacilities}
        />
        <StatCard
          icon={faNetworkWired}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          label="Föderationen"
          value={totalFederations}
        />
        <StatCard
          icon={faUserPlus}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="Offene Beitrittsanfragen"
          value={userJoinRequests.length}
          href="/joining-requests"
          linkLabel="Anfragen verwalten →"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FacilitySplitChart facilities={totalFacilities} federations={totalFederations} />
        </div>
        <div className="lg:col-span-2">
          <UserJoinRequests data={userJoinRequests} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivities data={userActivities} />
        <UserApprovals data={userApprovals} />
      </div>
    </div>
  );
}
