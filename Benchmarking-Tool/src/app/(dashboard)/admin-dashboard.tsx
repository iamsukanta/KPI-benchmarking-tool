"use client";

import { DashboardResult } from '@/lib/types/auth';
import UserActivities from '@/app/(dashboard)/_components/dashboard/user-activities';
import UserJoinRequests from '@/app/(dashboard)/_components/dashboard/user-join-requests';
import Facilities from '@/app/(dashboard)/_components/dashboard/facilities';
import UserApprovals from '@/app/(dashboard)/_components/dashboard/user-approvals';

export default function AdminDashboard({ results }: { results: DashboardResult}) {
  const userActivities = results.user_activities;
  const facilityCount = results.facilities;
  const userJoinRequests = results.user_join_requests || [];
  const userApprovals = results.user_approvals || [];

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Benchmark-Cockpit</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {facilityCount && <Facilities data={facilityCount} />}
        <UserActivities data={userActivities} />
        <UserJoinRequests data={userJoinRequests} />
        <UserApprovals data={userApprovals} />
      </div>
    </>
  );
}
