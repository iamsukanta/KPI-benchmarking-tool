"use client";

import { useEffect, useState } from "react";
import { getDashboard } from '@/lib/api/dashboard';
import { DashboardResult } from '@/lib/types/auth';
import { useAuth } from '@/context/auth-context';
import AdminDashboard from '@/app/(dashboard)/admin-dashboard';
import FacilityManagerDashboard from '@/app/(dashboard)/facility-manager-dashboard';
import FederationManagerDashboard from '@/app/(dashboard)/federation-manager-dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<DashboardResult>();

  useEffect(() => {
    async function load() {
      const { results } = await getDashboard();
      setResults(results);
    }
    load();
  }, []);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (user?.role === "admin") return <AdminDashboard results={results} />;
  if (user?.role === "federation_manager") return <FederationManagerDashboard results={results} />;
  return <FacilityManagerDashboard results={results} />;
}
