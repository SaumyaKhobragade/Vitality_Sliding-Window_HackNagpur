"use client";

import React from "react";
import { Play, Pause, Activity, Square } from "lucide-react";
import { useSimulation } from "../Context/SimulationContext";
import { useRouter, usePathname } from "next/navigation";

export function SimulationStatusBadge() {
  const { isRunning, simStats, handleRunToggle } = useSimulation();
  const router = useRouter();
  const pathname = usePathname();

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      await handleRunToggle();
    }
  };

  const handleBadgeClick = () => {
    router.push("/dashboard/simulation");
  };

  // Don't show on simulation page itself
  if (pathname === "/dashboard/simulation") return null;
  
  // Don't show if simulation is not active
  if (!isRunning && !simStats) return null;

  return (
    <div
      onClick={handleBadgeClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group cursor-pointer"
    >
      <div className="relative">
        {isRunning ? (
          <Activity className="w-5 h-5 animate-pulse" />
        ) : (
          <Pause className="w-5 h-5" />
        )}
        {isRunning && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>
      <div className="text-left">
        <div className="text-lg font-semibold opacity-90">
          {isRunning ? "Simulation Running" : "Simulation Paused"}
        </div>
        {simStats && (
          <div className="text-sm opacity-75 flex gap-3">
            <span>{simStats.totalHospitals} Hospitals</span>
            <span>•</span>
            <span>{simStats.totalPatientsWaiting} Waiting</span>
          </div>
        )}
      </div>
      {isRunning && (
        <button
          onClick={handleStop}
          className="ml-2 p-2 rounded-lg hover:bg-red-600 bg-red-500 transition-colors"
          title="Stop Simulation"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      )}
      <div className="ml-1 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        →
      </div>
    </div>
  );
}
