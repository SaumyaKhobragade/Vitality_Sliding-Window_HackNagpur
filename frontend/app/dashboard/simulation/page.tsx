"use client";

import React, { useState, useEffect } from "react";
import { LogEntry } from "@/lib/types";
import { SimulationHeader } from "../../Components/Simulation/SimulationHeader";
import { ChaosControls } from "../../Components/Simulation/ChaosControls";
import { LiveImpactAnalysis } from "../../Components/Simulation/LiveImpactAnalysis";
import { EventStream } from "../../Components/Simulation/EventStream";
import * as ApiClient from "@/lib/api-client";
import { toast } from "sonner";

// --- Mock Data & Constants ---
import { INITIAL_LOGS, LOG_TEMPLATES } from "@/db/mockdata";

// --- Main Page Component ---

export default function SimulationPage() {
  // State: Chaos Controls
  const [patientSurge, setPatientSurge] = useState(7.0);
  const [staffDropout, setStaffDropout] = useState(24);
  const [distressFreq, setDistressFreq] = useState<"LOW" | "MED" | "HIGH">(
    "MED",
  );
  const [policyLogic, setPolicyLogic] = useState("standard");

  // State: Simulation
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  const handleRunToggle = async () => {
    const newState = !isRunning;
    setIsRunning(newState);
    
    if (newState) {
      try {
        await ApiClient.initCity(5);
        toast.success("Simulation initialized with 5 hospitals.");
        
        const now = new Date();
        setLogs((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            timestamp: now.toLocaleTimeString("en-US", { hour12: false }),
            level: "SUCCESS",
            message: "Backend simulation initialized.",
          },
        ]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to initialize backend simulation.");
        setIsRunning(false);
      }
    }
  };

  const handleReset = async () => {
    setIsRunning(false);
    setPatientSurge(1.0);
    setStaffDropout(0);
    setDistressFreq("LOW");
    setLogs(INITIAL_LOGS);
    try {
        await ApiClient.initCity(0);
        toast.info("Simulation reset.");
    } catch (e) {
        // Ignore reset errors
    }
  };

  const triggerBackendSurge = async () => {
    try {
        const count = Math.floor(patientSurge * 5);
        await ApiClient.triggerSurge(count);
        toast.success(`Injected ${count} patients into the city.`);
    } catch (error) {
        toast.error("Failed to trigger backend surge.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg-main p-8 space-y-8 font-sans text-neutral-text-primary">
      {/* Component 1: Header */}
      <SimulationHeader
        isRunning={isRunning}
        onRunToggle={handleRunToggle}
        onReset={handleReset}
      />

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
        onTriggerSurge={triggerBackendSurge}
      />

      {/* --- Main Dashboard Area --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live Impact Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <LiveImpactAnalysis />
        </div>

        {/* Right Col: Event Stream */}
        <div className="lg:col-span-1">
          <EventStream logs={logs} />
        </div>
      </div>
    </div>
  );
}
