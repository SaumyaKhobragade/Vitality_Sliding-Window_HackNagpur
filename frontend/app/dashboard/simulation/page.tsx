"use client";

import React, { useState, useEffect } from "react";
import { LogEntry } from "@/lib/types";
import { SimulationHeader } from "../../Components/Simulation/SimulationHeader";
import { ChaosControls } from "../../Components/Simulation/ChaosControls";
import { LiveImpactAnalysis } from "../../Components/Simulation/LiveImpactAnalysis";
import { EventStream } from "../../Components/Simulation/EventStream";

// --- Mock Data & Constants ---
import { INITIAL_LOGS, INITIAL_CHART_DATA, LOG_TEMPLATES } from "@/db/mockdata";

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

  // Note: chartData state type is inferred or can be typed as ChartData<"line">
  const [chartData, setChartData] = useState<any>(INITIAL_CHART_DATA);

  // Simulation Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        // Random log generation
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newLog: LogEntry = {
          id: Math.random().toString(36).substring(7),
          timestamp: timeString,
          level: Math.random() > 0.8 ? "WARN" : "INFO",
          message:
            Math.random() > 0.5
              ? LOG_TEMPLATES.waitTimesSpike(Math.floor(Math.random() * 10))
              : LOG_TEMPLATES.rerouting,
        };

        // Occasional critical error
        if (Math.random() > 0.95) {
          newLog.level = "CRITICAL";
          newLog.message = LOG_TEMPLATES.surge(patientSurge);
        }

        setLogs((prev) => [...prev.slice(-15), newLog]);
        setChartData((prev: any) => {
          const newData0 = [...prev.datasets[0].data];
          const newData1 = [...prev.datasets[1].data];

          const lastVal0 = newData0[newData0.length - 1] as number;
          const nextVal0 = Math.max(
            10,
            lastVal0 + (Math.random() * 6 - 2) * (patientSurge / 5),
          );

          newData0.shift();
          newData0.push(nextVal0);

          return {
            ...prev,
            datasets: [
              { ...prev.datasets[0], data: newData0 },
              { ...prev.datasets[1], data: newData1 },
            ],
          };
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isRunning, patientSurge]);

  const handleRunToggle = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // Add start log
      const now = new Date();
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: now.toLocaleTimeString("en-US", { hour12: false }),
          level: "SUCCESS",
          message: "Simulation started.",
        },
      ]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPatientSurge(1.0);
    setStaffDropout(0);
    setDistressFreq("LOW");
    setLogs(INITIAL_LOGS);
    setChartData(INITIAL_CHART_DATA);
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
      />

      {/* --- Main Dashboard Area --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live Impact Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <LiveImpactAnalysis chartData={chartData} />
        </div>

        {/* Right Col: Event Stream */}
        <div className="lg:col-span-1">
          <EventStream logs={logs} />
        </div>
      </div>
    </div>
  );
}
