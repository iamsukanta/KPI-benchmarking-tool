import type { Metadata } from 'next';
import Dashboard from '@/app/(dashboard)/dashboard';

export const metadata: Metadata = {
  title: "Armaturenbrett"
}

export default function DashboardPage() {
  return <Dashboard />;
}
