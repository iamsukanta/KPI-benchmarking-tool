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
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import "@/components/benchmark-chart";
import Link from 'next/link';
import { DashboardResult } from '@/lib/types/auth';
import UserActivities from '@/app/(dashboard)/_components/dashboard/user-activities';

function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || !isFinite(denominator) || isNaN(denominator)) return 0;
  const result = numerator / denominator;
  return isFinite(result) ? result : 0;
}

export default function FacilityManagerDashboard({ results }: { results: DashboardResult}) {
  const facilitiesData = results.facility_stats || [];
  const aggregatedStats = facilitiesData.reduce((acc, facility) => {
    acc.totalFacilities += 1;
    acc.totalBeds += facility.beds;
    acc.totalRooms += facility.rooms;
    acc.currentRevenue += facility.current_year.total_revenue;
    acc.currentCosts += facility.current_year.total_costs;
    acc.currentStays += facility.current_year.overnight_stays;
    acc.previousRevenue += facility.previous_year.total_revenue;
    acc.previousCosts += facility.previous_year.total_costs;
    acc.previousStays += facility.previous_year.overnight_stays;

    if (!acc.currentYear) acc.currentYear = facility.current_year.year;
    if (!acc.previousYear) acc.previousYear = facility.previous_year.year;
    return acc;
  }, {
    totalFacilities: 0,
    totalBeds: 0,
    totalRooms: 0,
    currentRevenue: 0,
    currentCosts: 0,
    currentStays: 0,
    previousRevenue: 0,
    previousCosts: 0,
    previousStays: 0,
    currentYear: 0,
    previousYear: 0
  });

  const currentProfit = aggregatedStats.currentRevenue - aggregatedStats.currentCosts;
  const previousProfit = aggregatedStats.previousRevenue - aggregatedStats.previousCosts;

  const revenueGrowth = safeDivide(aggregatedStats.currentRevenue - aggregatedStats.previousRevenue, aggregatedStats.previousRevenue) * 100;
  const costsGrowth = safeDivide(aggregatedStats.currentCosts - aggregatedStats.previousCosts, aggregatedStats.previousCosts) * 100;
  const profitGrowth = safeDivide(currentProfit - previousProfit, previousProfit) * 100;
  const staysGrowth = safeDivide(aggregatedStats.currentStays - aggregatedStats.previousStays, aggregatedStats.previousStays) * 100;

  const avgOpeningDaysPerYear = facilitiesData.length > 0
    ? facilitiesData.map(f => f?.opening_days_per_year ?? 0).reduce((acc, cur) => acc + cur, 0) / facilitiesData.length
    : 0;
  const totalCapacity = aggregatedStats.totalBeds * avgOpeningDaysPerYear;
  const avgOccupancy = safeDivide(aggregatedStats.currentStays, totalCapacity) * 100;

  const aggregatedRevenueData: ChartData<"bar", number[], string> = {
    labels: ['Gesamtumsatz', 'Gesamtkosten', 'Reingewinn'],
    datasets: [
      {
        label: aggregatedStats.currentYear.toString(),
        data: [aggregatedStats.currentRevenue, aggregatedStats.currentCosts, currentProfit],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: aggregatedStats.previousYear.toString(),
        data: [aggregatedStats.previousRevenue, aggregatedStats.previousCosts, previousProfit],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const aggregatedRevenueOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 14, weight: 600 },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': €' + context.parsed.y?.toLocaleString('de-DE');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return '€' + (value as number / 1000) + 'k';
          }
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const facilitiesComparisonData: ChartData<"bar", number[], string> = {
    labels: facilitiesData.map(f => f.name),
    datasets: [
      {
        label: 'Einnahmen',
        data: facilitiesData.map(f => f.current_year.total_revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Kosten',
        data: facilitiesData.map(f => f.current_year.total_costs),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const facilitiesComparisonOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 14, weight: 600 },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': €' + context.parsed.y?.toLocaleString('de-DE');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return '€' + (value as number / 1000) + 'k';
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat('de-DE').format(value);
  }

  return (
    <div className="space-y-6">
      {/* Kopfzeile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Benchmark-Cockpit</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Übersicht aller Ihrer Einrichtungen • {aggregatedStats.totalFacilities} Einrichtungen
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">{ aggregatedStats.currentYear } Gesamtleistung</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSackDollar} className="w-6 h-6 text-green-600" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <FontAwesomeIcon
                    icon={revenueGrowth >= 0 ? faArrowTrendUp : faArrowTrendDown}
                    className={`w-3 h-3 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className={`text-xs font-semibold ${
                    revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Gesamtumsatz</p>
              <p className="text-3xl font-bold text-slate-800">{formatCurrency(aggregatedStats.currentRevenue)}</p>
              <p className="text-xs text-slate-500 mt-2">An {aggregatedStats.totalFacilities} Einrichtungen</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="w-6 h-6 text-red-600" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  costsGrowth <= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <FontAwesomeIcon
                    icon={costsGrowth >= 0 ? faArrowTrendUp : faArrowTrendDown}
                    className={`w-3 h-3 ${costsGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className={`text-xs font-semibold ${
                    costsGrowth <= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(costsGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Gesamtkosten</p>
              <p className="text-3xl font-bold text-slate-800">{formatCurrency(aggregatedStats.currentCosts)}</p>
              <p className="text-xs text-slate-500 mt-2">Kombinierte Betriebskosten</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${currentProfit >= 0 ? 'bg-brand-100' : 'bg-red-100'} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={faChartLine} className={`w-6 h-6 ${currentProfit >= 0 ? 'text-brand-600' : 'text-red-600'}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  profitGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <FontAwesomeIcon
                    icon={profitGrowth >= 0 ? faArrowTrendUp : faArrowTrendDown}
                    className={`w-3 h-3 ${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className={`text-xs font-semibold ${
                    profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(profitGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Reingewinn</p>
              <p className={`text-3xl font-bold ${currentProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(currentProfit)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {(safeDivide(currentProfit, aggregatedStats.currentRevenue) * 100).toFixed(1)}% Marge
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faPercent} className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  staysGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <FontAwesomeIcon
                    icon={staysGrowth >= 0 ? faArrowTrendUp : faArrowTrendDown}
                    className={`w-3 h-3 ${staysGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className={`text-xs font-semibold ${
                    staysGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(staysGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Durchschnittliche Auslastung</p>
              <p className="text-3xl font-bold text-slate-800">{avgOccupancy.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-2">{formatNumber(aggregatedStats.currentStays)} Gesamtaufenthalte</p>
            </div>
          </div>
        </div>
      </div>

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
          <div className="p-6" style={{ height: '350px' }}>
            <Bar data={aggregatedRevenueData} options={aggregatedRevenueOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Einrichtungsvergleich</h3>
                <p className="text-xs text-slate-500">Einnahmen vs. Kosten</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ height: '350px' }}>
            <Bar data={facilitiesComparisonData} options={facilitiesComparisonOptions} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Ihre Einrichtungen</h3>
          <p className="text-sm text-slate-500">{aggregatedStats.totalFacilities} Einrichtungen • {aggregatedStats.totalBeds} Betten insgesamt</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilitiesData.map((facility) => {
            const profit = facility.current_year.total_revenue - facility.current_year.total_costs;
            const profitMargin = safeDivide(profit, facility.current_year.total_revenue) * 100;
            const occupancy = safeDivide(facility.current_year.overnight_stays, facility.beds * 365) * 100;

            const prevProfit = facility.previous_year.total_revenue - facility.previous_year.total_costs;
            const profitChange = safeDivide(profit - prevProfit, prevProfit) * 100;

            return (
              <div
                key={facility.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden"
              >
                {/* Kartenüberschrift */}
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

                  {/* Einrichtungsinfo */}
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
                      <p className="text-base font-bold text-green-600">
                        {formatCurrency(facility.current_year.total_revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Kosten</p>
                      <p className="text-base font-bold text-red-600">
                        {formatCurrency(facility.current_year.total_costs)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Gewinn</p>
                      <div className="flex items-center gap-1">
                        <p className={`text-base font-bold ${profit >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </p>
                        <div className={`flex items-center gap-0.5 ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <FontAwesomeIcon
                            icon={profitChange >= 0 ? faArrowTrendUp : faArrowTrendDown}
                            className="w-2.5 h-2.5"
                          />
                        </div>
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
                        style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
                      ></div>
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
          })}
        </div>
      </div>

      <UserActivities data={results.user_activities} />
    </div>
  );
}
