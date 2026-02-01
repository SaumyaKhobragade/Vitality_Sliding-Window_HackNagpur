"use client";

import React from "react";
import { SimulationHeader } from "../../Components/Simulation/SimulationHeader";
import { ChaosControls } from "../../Components/Simulation/ChaosControls";
import { LiveImpactAnalysisFrontend } from "../../Components/Simulation/LiveImpactAnalysisFrontend";
import { EventStream } from "../../Components/Simulation/EventStream";
import { useSimulation } from "../../Components/Context/SimulationContext";
import { Toaster } from "@/components/ui/sonner";

// --- Main Page Component ---

export default function SimulationPage() {
  // Get simulation state and controls from context
  const {
    // State
    isRunning,
    isLoading,
    logs,
    simStats,
    avgWaitTime,
    processedCount,
    persistenceEnabled,
    totalRedirections,

    // Controls
    handleRunToggle,
    handleReset,
    triggerSurge,
    triggerStaffDropout,

    // Configuration
    patientSurge,
    setPatientSurge,
    staffDropout,
    setStaffDropout,
    distressFreq,
    setDistressFreq,
    policyLogic,
    setPolicyLogic,
    setPersistenceEnabled,
    floodHospitals,
  } = useSimulation();

  return (
    <div className="min-h-screen bg-neutral-bg-main p-8 space-y-8 font-sans text-neutral-text-primary">
      {/* Component 1: Header */}
      <SimulationHeader
        isRunning={isRunning}
        onRunToggle={handleRunToggle}
        onReset={handleReset}
      />

      {/* Loading overlay indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">Processing...</span>
        </div>
      )}

      {/* Status Bar with Flood Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Supabase Persistence Toggle */}
        <button
          onClick={() => setPersistenceEnabled(!persistenceEnabled)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${persistenceEnabled
            ? "bg-blue-50 border border-blue-200 text-blue-800"
            : "bg-neutral-100 border border-neutral-200 text-neutral-600"
            }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${persistenceEnabled ? "bg-blue-500" : "bg-neutral-400"}`}
          ></span>
          {persistenceEnabled ? " Supabase Persistence ON" : " Persistence OFF"}
        </button>

        {/* Flood Hospitals Button */}
        <button
          onClick={() => floodHospitals()}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all bg-slate-800 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
        >
          Flood Hospitals
        </button>
      </div>
      {/* Component 2: Chaos Controls */}
      <ChaosControls
        patientSurge={patientSurge}
        setPatientSurge={setPatientSurge}
        staffDropout={staffDropout}
        setStaffDropout={setStaffDropout}
        distressFreq={distressFreq}
        setDistressFreq={setDistressFreq}
        policyLogic={policyLogic}
        setPolicyLogic={setPolicyLogic}
        onTriggerSurge={() => triggerSurge()}
        onTriggerStaffDropout={() => triggerStaffDropout(staffDropout)}
      />

      {/* --- Main Dashboard Area --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live Impact Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <LiveImpactAnalysisFrontend
            stats={simStats}
            avgWaitTime={avgWaitTime}
            processedCount={processedCount}
            isRunning={isRunning}
            totalRedirections={totalRedirections}
            logs={logs}
          />
        </div>

        {/* Right Col: Event Stream */}
        <div className="lg:col-span-1">
          <EventStream logs={logs} />
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
