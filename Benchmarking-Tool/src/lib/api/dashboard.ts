import { DashboardResponse } from '@/lib/types/auth';

export async function getDashboard(): Promise<DashboardResponse> {
  const res = await fetch('/api/proxy/dashboard/');
  return res.json();
}
