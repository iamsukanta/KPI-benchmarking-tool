"use client";

import { ActivityDashboardData } from '@/lib/types/auth';

export default function BenchmarkAttempts({ data }: { data: ActivityDashboardData[] }) {
  function humanizeDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title-junior">Benchmark-Versuche</h1>
      </div>

      <div className="card-body-start px-7 pb-4">
        <ul className="list-disc pl-4 space-y-4">
          {data.map((item, key) => {
            return (
              <li
                key={key}
                className="pb-4 border-b border-slate-200"
              >{item.activity.charAt(0).toUpperCase() + item.activity.slice(1)} at{" "} at {humanizeDate(item.created_at)}.</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
