"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faChartLine,
  faMoneyBillWave,
  faSackDollar,
  faArrowTrendUp,
  faArrowTrendDown,
  faTag,
  faEye,
  faChartBar,
  faPercent,
  faArrowRight,
  faLayerGroup,
  faNetworkWired,
  faBuildingColumns,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "@/components/benchmark-chart";
import Link from 'next/link';
import { DashboardResult } from '@/lib/types/auth';
import UserActivities from '@/app/(dashboard)/_components/dashboard/user-activities';
import { useState } from 'react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, RadialLinearScale,
  PointElement, LineElement, Filler, Title, Tooltip, Legend
);

type FacilityStat = NonNullable<DashboardResult['federation_stats']>[number]['facilities'][number];
type FederationStat = NonNullable<DashboardResult['federation_stats']>[number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('de-DE').format(value);
}

function pct(a: number, b: number) {
  if (!b) return 0;
  // Divide by |b| so a recovery from a negative base (e.g. loss → profit) reads
  // as positive growth instead of an inverted-sign value.
  return ((a - b) / Math.abs(b)) * 100;
}

function aggregateFacilities(facilities: FacilityStat[]) {
  return facilities.reduce(
    (acc, f) => {
      acc.beds += f.beds;
      acc.rooms += f.rooms;
      acc.currentRevenue += f.current_year.total_revenue;
      acc.currentCosts += f.current_year.total_costs;
      acc.currentStays += f.current_year.overnight_stays;
      acc.previousRevenue += f.previous_year.total_revenue;
      acc.previousCosts += f.previous_year.total_costs;
      acc.previousStays += f.previous_year.overnight_stays;
      // Real annual capacity per facility: beds × its own opening days.
      acc.capacity += f.beds * (f.opening_days_per_year ?? 0);
      if (!acc.currentYear) acc.currentYear = f.current_year.year;
      if (!acc.previousYear) acc.previousYear = f.previous_year.year;
      return acc;
    },
    {
      beds: 0, rooms: 0, capacity: 0,
      currentRevenue: 0, currentCosts: 0, currentStays: 0,
      previousRevenue: 0, previousCosts: 0, previousStays: 0,
      currentYear: 0, previousYear: 0,
    }
  );
}

function KpiCard({
  icon, iconBg, iconColor, label, value, growth,
  sub, invertGrowth = false,
}: {
  icon: any; iconBg: string; iconColor: string;
  label: string; value: string; growth: number;
  sub: string; invertGrowth?: boolean;
}) {
  const positive = invertGrowth ? growth <= 0 : growth >= 0;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${positive ? 'bg-green-100' : 'bg-red-100'}`}>
            <FontAwesomeIcon
              icon={growth >= 0 ? faArrowTrendUp : faArrowTrendDown}
              className={`w-3 h-3 ${positive ? 'text-green-600' : 'text-red-600'}`}
            />
            <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(growth).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{sub}</p>
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: FacilityStat }) {
  const profit = facility.current_year.total_revenue - facility.current_year.total_costs;
  const profitMargin = facility.current_year.total_revenue
    ? (profit / facility.current_year.total_revenue) * 100 : 0;
  const occupancy = facility.beds
    ? (facility.current_year.overnight_stays / (facility.beds * facility.opening_days_per_year)) * 100 : 0;
  const prevProfit = facility.previous_year.total_revenue - facility.previous_year.total_costs;
  const profitChange = pct(profit, prevProfit);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-white border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-brand-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-bold text-slate-800 truncate">{facility.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-slate-500" />
                <p className="text-xs text-slate-600 truncate">{facility.category}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Zimmer</p>
            <p className="text-lg font-bold text-slate-800">{facility.rooms}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Betten</p>
            <p className="text-lg font-bold text-slate-800">{facility.beds}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Belegung</p>
            <p className="text-lg font-bold text-purple-600">{occupancy.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Einnahmen</p>
            <p className="text-base font-bold text-green-600">{formatCurrency(facility.current_year.total_revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Kosten</p>
            <p className="text-base font-bold text-red-600">{formatCurrency(facility.current_year.total_costs)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Profitieren</p>
            <div className="flex items-center gap-1">
              <p className={`text-base font-bold ${profit >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </p>
              <FontAwesomeIcon
                icon={profitChange >= 0 ? faArrowTrendUp : faArrowTrendDown}
                className={`w-2.5 h-2.5 ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-600 font-medium">Gewinnspanne</p>
            <p className="text-xs font-bold text-slate-800">{profitMargin.toFixed(1)}%</p>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(profitMargin, 100))}%` }}
            />
          </div>
        </div>

        <Link
          href={`/facilities/${facility.id}/detail`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          <span>Jahresdaten Ansehen</span>
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

function FederationView({ federation }: { federation: FederationStat }) {
  const stats = aggregateFacilities(federation.facilities);
  const currentProfit = stats.currentRevenue - stats.currentCosts;
  const previousProfit = stats.previousRevenue - stats.previousCosts;

  const revenueGrowth = pct(stats.currentRevenue, stats.previousRevenue);
  const costsGrowth = pct(stats.currentCosts, stats.previousCosts);
  const profitGrowth = pct(currentProfit, previousProfit);
  const staysGrowth = pct(stats.currentStays, stats.previousStays);
  const avgOccupancy = stats.capacity ? (stats.currentStays / stats.capacity) * 100 : 0;

  const combinedChartData: ChartData<"bar", number[], string> = {
    labels: ['Total Revenue', 'Total Costs', 'Net Profit'],
    datasets: [
      {
        label: stats.currentYear.toString(),
        data: [stats.currentRevenue, stats.currentCosts, currentProfit],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2, borderRadius: 8,
      },
      {
        label: stats.previousYear.toString(),
        data: [stats.previousRevenue, stats.previousCosts, previousProfit],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2, borderRadius: 8,
      },
    ],
  };

  const facilitiesChartData: ChartData<"bar", number[], string> = {
    labels: federation.facilities.map(f => f.name),
    datasets: [
      {
        label: 'Revenue',
        data: federation.facilities.map(f => f.current_year.total_revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2, borderRadius: 8,
      },
      {
        label: 'Costs',
        data: federation.facilities.map(f => f.current_year.total_costs),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2, borderRadius: 8,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 13, weight: 600 }, padding: 15, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y))}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: v => '€' + ((v as number) / 1000) + 'k' },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">{stats.currentYear} Gesamtleistung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard icon={faSackDollar} iconBg="bg-green-100" iconColor="text-green-600"
            label="Total Revenue" value={formatCurrency(stats.currentRevenue)}
            growth={revenueGrowth} sub={`Across ${federation.facilities.length} facilities`} />
          <KpiCard icon={faMoneyBillWave} iconBg="bg-red-100" iconColor="text-red-600"
            label="Total Costs" value={formatCurrency(stats.currentCosts)}
            growth={costsGrowth} sub="Combined operational costs" invertGrowth />
          <KpiCard
            icon={faChartLine}
            iconBg={currentProfit >= 0 ? 'bg-brand-100' : 'bg-red-100'}
            iconColor={currentProfit >= 0 ? 'text-brand-600' : 'text-red-600'}
            label="Net Profit" value={formatCurrency(currentProfit)}
            growth={profitGrowth}
            sub={`${stats.currentRevenue ? ((currentProfit / stats.currentRevenue) * 100).toFixed(1) : 0}% margin`}
          />
          <KpiCard icon={faPercent} iconBg="bg-purple-100" iconColor="text-purple-600"
            label="Avg Occupancy" value={`${avgOccupancy.toFixed(1)}%`}
            growth={staysGrowth} sub={`${formatNumber(stats.currentStays)} total stays`} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Kombinierte Leistung</h3>
                <p className="text-xs text-slate-500">Vergleich zum Vorjahr</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ height: 350 }}>
            <Bar data={combinedChartData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Anlagenvergleich</h3>
                <p className="text-xs text-slate-500">{stats.currentYear} einnahmen vs. kosten</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ height: 350 }}>
            <Bar data={facilitiesChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Facility Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Facilities in {federation.name}</h3>
          <p className="text-sm text-slate-500">
            {federation.facilities.length} einrichtungen · {stats.beds} betten total
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {federation.facilities.map(f => <FacilityCard key={f.id} facility={f} />)}
        </div>
      </div>
    </div>
  );
}

function AllFederationsView({ federations }: { federations: FederationStat[] }) {
  // Aggregate everything across all federations
  const allFacilities = federations.flatMap(f => f.facilities);
  const total = aggregateFacilities(allFacilities);
  const totalProfit = total.currentRevenue - total.currentCosts;
  const prevProfit = total.previousRevenue - total.previousCosts;

  const fedStats = federations.map(fed => {
    const s = aggregateFacilities(fed.facilities);
    return { ...fed, stats: s, profit: s.currentRevenue - s.currentCosts };
  });

  const crossFedChart: ChartData<"bar", number[], string> = {
    labels: federations.map(f => f.name),
    datasets: [
      {
        label: 'Revenue',
        data: fedStats.map(f => f.stats.currentRevenue),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2, borderRadius: 8,
      },
      {
        label: 'Costs',
        data: fedStats.map(f => f.stats.currentCosts),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2, borderRadius: 8,
      },
      {
        label: 'Profit',
        data: fedStats.map(f => f.profit),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2, borderRadius: 8,
      },
    ],
  };

  const crossFedOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 13, weight: 600 }, padding: 15, usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y))}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: v => '€' + ((v as number) / 1000) + 'k' },
      },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  const occupancyData: ChartData<"bar", number[], string> = {
    labels: federations.map(f => f.name),
    datasets: [
      {
        label: 'Avg Occupancy %',
        data: fedStats.map(f =>
          f.stats.capacity ? (f.stats.currentStays / f.stats.capacity) * 100 : 0
        ),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2, borderRadius: 8,
      },
    ],
  };

  const occupancyOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8,
        callbacks: { label: ctx => `Occupancy: ${ctx.parsed.y?.toFixed(1)}%` },
      },
    },
    scales: {
      y: {
        beginAtZero: true, max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: v => v + '%' },
      },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {total.currentYear} · Alle Verbände Zusammen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard icon={faSackDollar} iconBg="bg-green-100" iconColor="text-green-600"
            label="Total Revenue" value={formatCurrency(total.currentRevenue)}
            growth={pct(total.currentRevenue, total.previousRevenue)}
            sub={`${federations.length} federations · ${allFacilities.length} facilities`} />
          <KpiCard icon={faMoneyBillWave} iconBg="bg-red-100" iconColor="text-red-600"
            label="Total Costs" value={formatCurrency(total.currentCosts)}
            growth={pct(total.currentCosts, total.previousCosts)}
            sub="Combined operational costs" invertGrowth />
          <KpiCard
            icon={faChartLine}
            iconBg={totalProfit >= 0 ? 'bg-brand-100' : 'bg-red-100'}
            iconColor={totalProfit >= 0 ? 'text-brand-600' : 'text-red-600'}
            label="Net Profit" value={formatCurrency(totalProfit)}
            growth={pct(totalProfit, prevProfit)}
            sub={`${total.currentRevenue ? ((totalProfit / total.currentRevenue) * 100).toFixed(1) : 0}% margin`}
          />
          <KpiCard icon={faPercent} iconBg="bg-purple-100" iconColor="text-purple-600"
            label="Avg Occupancy"
            value={`${total.capacity ? ((total.currentStays / total.capacity) * 100).toFixed(1) : 0}%`}
            growth={pct(total.currentStays, total.previousStays)}
            sub={`${formatNumber(total.currentStays)} total stays`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faNetworkWired} className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Föderationsvergleich</h3>
                <p className="text-xs text-slate-500">Einnahmen, Kosten und Gewinn nach Verband</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ height: 350 }}>
            <Bar data={crossFedChart} options={crossFedOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faPercent} className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Besetzung durch die Föderation</h3>
                <p className="text-xs text-slate-500">Durchschnittliche Bettenauslastung</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ height: 350 }}>
            <Bar data={occupancyData} options={occupancyOptions} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Zusammenbruch der Föderation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fedStats.map((fed) => {
            const occupancy = fed.stats.capacity
              ? (fed.stats.currentStays / fed.stats.capacity) * 100 : 0;
            const margin = fed.stats.currentRevenue
              ? (fed.profit / fed.stats.currentRevenue) * 100 : 0;
            const revGrowth = pct(fed.stats.currentRevenue, fed.stats.previousRevenue);

            return (
              <div key={fed.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-brand-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faBuildingColumns} className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{fed.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fed.facilities.length} einrichtungen · {fed.stats.beds} betten
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ${revGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <FontAwesomeIcon
                        icon={revGrowth >= 0 ? faArrowTrendUp : faArrowTrendDown}
                        className={`w-3 h-3 ${revGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      />
                      <span className={`text-xs font-semibold ${revGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(revGrowth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Einnahmen</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(fed.stats.currentRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Kosten</p>
                      <p className="text-sm font-bold text-red-600">{formatCurrency(fed.stats.currentCosts)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Profitieren</p>
                      <p className={`text-sm font-bold ${fed.profit >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                        {formatCurrency(fed.profit)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Belegung</span>
                      <span className="text-xs font-bold text-slate-700">{occupancy.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-brand-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Gewinnspanne</span>
                      <span className="text-xs font-bold text-slate-700">{margin.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${margin >= 0 ? 'bg-gradient-to-r from-brand-500 to-purple-600' : 'bg-red-400'}`}
                        style={{ width: `${Math.max(0, Math.min(Math.abs(margin), 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ALL_KEY = "__all__";

export default function FederationManagerDashboard({ results }: { results: DashboardResult }) {
  const federations = results.federation_stats ?? [];
  const [selectedId, setSelectedId] = useState<string>(
    federations.length === 1 ? String(federations[0].id) : ALL_KEY
  );

  const selectedFederation = federations.find(f => String(f.id) === selectedId) ?? null;
  const isAll = selectedId === ALL_KEY;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Verbund-Cockpit</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {federations.length} {federations.length === 1 ? 'föderation' : 'verbände'} ·{' '}
              {federations.reduce((s, f) => s + f.facilities.length, 0)} einrichtungen insgesamt
            </p>
          </div>
        </div>
      </div>

      {federations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5">
          <div className="flex flex-wrap gap-1.5">
            {federations.length > 1 && (
              <button
                onClick={() => setSelectedId(ALL_KEY)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isAll
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faTableColumns} className="w-3.5 h-3.5" />
                Alle Verbände
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isAll ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {federations.length}
                </span>
              </button>
            )}

            {federations.map(fed => {
              const isActive = String(fed.id) === selectedId;
              const s = aggregateFacilities(fed.facilities);
              return (
                <button
                  key={fed.id}
                  onClick={() => setSelectedId(String(fed.id))}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faBuildingColumns} className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{fed.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {fed.facilities.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {federations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faBuildingColumns} className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">Keine verbände gefunden</p>
          <p className="text-sm text-slate-500 mt-1">Wenden Sie sich an einen Administrator, um Ihrem Konto Verbunddienste zuzuweisen.</p>
        </div>
      ) : isAll ? (
        <AllFederationsView federations={federations} />
      ) : selectedFederation ? (
        <FederationView federation={selectedFederation} />
      ) : null}

      <UserActivities data={results.user_activities} />
    </div>
  );
}
