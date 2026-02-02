"use client";

import { Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { CityStats, LogEntry } from "@/lib/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      align: "end" as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        padding: 20,
        font: {
          family: "Inter",
          size: 12,
        },
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      backgroundColor: "rgba(17, 24, 39, 0.9)",
      titleColor: "#fff",
      bodyColor: "#CBD5E1",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      grid: {
        color: "#E2E8F0",
        borderDash: [4, 4],
      },
      ticks: {
        color: "#94A3B8",
        font: { family: "Inter", size: 10 },
      },
    },
  },
  interaction: {
    mode: "nearest" as const,
    axis: "x" as const,
    intersect: false,
  },
};

interface LiveImpactAnalysisFrontendProps {
  stats: CityStats | null;
  avgWaitTime: number;
  processedCount: number;
  isRunning: boolean;
  totalRedirections?: number;
  logs?: LogEntry[];
}

export function LiveImpactAnalysisFrontend({
  stats,
  avgWaitTime,
  processedCount,
  isRunning,
  totalRedirections = 0,
  logs = [],
}: LiveImpactAnalysisFrontendProps) {
  const [queueHistory, setQueueHistory] = useState<number[]>([]);
  const [doctorHistory, setDoctorHistory] = useState<number[]>([]);
  const processRateRef = useRef<number>(0);
  const lastProcessedRef = useRef<number>(0);

  // Update history when stats change
  useEffect(() => {
    if (stats) {
      setQueueHistory((prev) => {
        const newHistory = [...prev, stats.totalPatientsWaiting];
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
      });
      setDoctorHistory((prev) => {
        const newHistory = [...prev, stats.totalDoctorsActive];
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
      });
    }
  }, [stats]);

  // Calculate process rate per minute
  useEffect(() => {
    const interval = setInterval(() => {
      const rate = processedCount - lastProcessedRef.current;
      processRateRef.current = rate;
      lastProcessedRef.current = processedCount;
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [processedCount]);

  // Update rate more frequently for display
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        const rate = processedCount - lastProcessedRef.current;
        processRateRef.current = Math.round(rate * (60 / 10)); // Extrapolate to per-minute
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isRunning, processedCount]);

  const chartData = {
    labels: queueHistory.map((_, i) => i),
    datasets: [
      {
        label: "Queue Length",
        data: queueHistory,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Active Doctors",
        data: doctorHistory,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-primary" />
          <CardTitle className="text-lg font-semibold text-neutral-text-primary">
            Live Impact Analysis
          </CardTitle>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-text-muted font-medium mb-1">
              Avg Wait
            </div>
            <div className="text-2xl font-bold text-neutral-text-primary">
              {avgWaitTime || "--"}
              <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                m
              </span>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-text-muted font-medium mb-1">
              Queue Total
            </div>
            <div className="text-2xl font-bold text-neutral-text-primary">
              {stats?.totalPatientsWaiting || 0}
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-text-muted font-medium mb-1">
              Processed
            </div>
            <div className="text-2xl font-bold text-neutral-text-primary">
              {processedCount}
              <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                total
              </span>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-text-muted font-medium mb-1">
              Doctors Active
            </div>
            <div className="text-2xl font-bold text-neutral-text-primary">
              {stats?.totalDoctorsActive || 0}
            </div>
          </div>
        </div>

        {/* Hospital Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-xs text-blue-600 font-medium mb-1">
              Hospitals
            </div>
            <div className="text-xl font-bold text-blue-700">
              {stats?.totalHospitals || 0}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="text-xs text-amber-600 font-medium mb-1">
              Redirections
            </div>
            <div className="text-xl font-bold text-amber-700">
              {totalRedirections > 0
                ? totalRedirections
                : logs.filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect')).length || stats?.recentRedirections || 0}
            </div>
          </div>
          <div
            className={`p-3 rounded-xl border transition-all duration-300 ${stats?.surgeActive
                ? "bg-red-50 border-red-200 ring-2 ring-red-300 ring-opacity-50"
                : "bg-purple-50 border-purple-100"
              }`}
          >
            <div
              className={`text-xs font-medium mb-1 flex items-center gap-1 ${stats?.surgeActive ? "text-red-600" : "text-purple-600"
                }`}
            >
              {stats?.surgeActive && (
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
              Surge Status
            </div>
            <div
              className={`text-xl font-bold ${stats?.surgeActive ? "text-red-700" : "text-purple-700"
                }`}
            >
              {stats?.surgeActive ? "🚨 ACTIVE" : "Normal"}
            </div>
            {stats?.surgeActive && (
              <div className="text-xs text-red-600 mt-1 font-medium">
                Scaled to 140%
              </div>
            )}
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 min-h-[300px] w-full relative">
          <Line options={CHART_OPTIONS} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}
