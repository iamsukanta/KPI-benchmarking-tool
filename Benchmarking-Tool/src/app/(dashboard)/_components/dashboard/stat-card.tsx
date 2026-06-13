"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  href,
  linkLabel,
}: {
  icon: typeof faArrowRight;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  const body = (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className={`w-6 h-6 ${iconColor}`} />
          </div>
          {href && (
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
            />
          )}
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{sub ?? linkLabel ?? " "}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        {body}
      </Link>
    );
  }

  return body;
}
