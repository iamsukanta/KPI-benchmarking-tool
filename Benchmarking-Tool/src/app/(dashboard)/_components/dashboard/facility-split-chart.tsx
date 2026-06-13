"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(ArcElement, Tooltip, Legend);

const EINRICHTUNG_COLOR = "#1470c9"; // brand-500
const FOEDERATION_COLOR = "#8b5cf6"; // violet-500 (federation accent)

export default function FacilitySplitChart({
  facilities,
  federations,
}: {
  facilities: number;
  federations: number;
}) {
  const total = facilities + federations;

  const data: ChartData<"doughnut"> = {
    labels: ["Einrichtungen", "Föderationen"],
    datasets: [
      {
        data: [facilities, federations],
        backgroundColor: [EINRICHTUNG_COLOR, FOEDERATION_COLOR],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const share = total ? Math.round((value / total) * 100) : 0;
            return ` ${ctx.label}: ${value} (${share}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faChartPie} className="w-4 h-4 text-slate-400" />
          Verteilung
        </h2>
      </div>

      <div className="p-6">
        {total === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartPie} className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Noch keine Daten</p>
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-44 w-44">
              <Doughnut data={data} options={options} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">{total}</span>
                <span className="text-xs text-slate-500">Gesamt</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <LegendRow color={EINRICHTUNG_COLOR} label="Einrichtungen" value={facilities} />
              <LegendRow color={FOEDERATION_COLOR} label="Föderationen" value={federations} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
