"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { CityStats, Hospital, LogEntry } from "@/lib/types";
import { useRealtime } from "./RealtimeContext";
import * as ApiClient from "@/lib/api-client";
import {
  SimulationEngine,
  SimulationEvent,
  SimulationState,
} from "@/lib/simulation-engine";
import { getShortPatientId } from "@/lib/utils";
import { toast } from "sonner";
import {
  handleSimulationEventPersistence,
  startPeriodicSync,
  stopPeriodicSync,
  loadHistoricalLogs,
  clearSimulationData,
  persistSimulationLog,
  forceFlushLogs,
  persistHospitals,
} from "@/lib/supabase-simulation";

interface SimulationContextType {
  stats: CityStats | null;
  hospitals: Record<string, Hospital>;
  redirectionEvents: any[];
  activeTreatments: Record<string, any[]>;
  totalRedirections: number;
  isConnected: boolean;
  refreshStats: () => Promise<void>;
  refreshHospital: (id: string) => Promise<void>;

  // Simulation engine state
  isRunning: boolean;
  isLoading: boolean;
  logs: LogEntry[];
  simStats: CityStats | null;
  processedCount: number;
  avgWaitTime: number;
  persistenceEnabled: boolean;

  // Simulation engine controls
  handleRunToggle: () => Promise<void>;
  handleReset: () => Promise<void>;
  triggerSurge: (count?: number) => void;
  triggerStaffDropout: (percent: number) => void;
  floodHospitals: () => Promise<void>;

  // Configuration
  patientSurge: number;
  setPatientSurge: (value: number) => void;
  staffDropout: number;
  setStaffDropout: (value: number) => void;
  distressFreq: "LOW" | "MED" | "HIGH";
  setDistressFreq: (value: "LOW" | "MED" | "HIGH") => void;
  policyLogic: string;
  setPolicyLogic: (value: string) => void;
  setPersistenceEnabled: (value: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined,
);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [hospitals, setHospitals] = useState<Record<string, Hospital>>({});
  const [redirectionEvents, setRedirectionEvents] = useState<any[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<
    Record<string, any[]>
  >({});
  const [totalRedirections, setTotalRedirections] = useState(0);
  const { socketService, isConnected } = useRealtime();

  // Simulation engine state
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [simStats, setSimStats] = useState<CityStats | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);
  const [persistenceEnabled, setPersistenceEnabled] = useState(true);

  // Chaos controls
  const [patientSurge, setPatientSurge] = useState(2.0);
  const [staffDropout, setStaffDropout] = useState(0);
  const [distressFreq, setDistressFreq] = useState<"LOW" | "MED" | "HIGH">(
    "MED",
  );
  const [policyLogic, setPolicyLogic] = useState("standard");

  // Engine ref to persist across renders
  const engineRef = useRef<SimulationEngine | null>(null);
  const isRunningRef = useRef(isRunning);

  // Keep ref in sync with state
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const refreshStats = async () => {
    try {
      const data = await ApiClient.getCityStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch initial stats", error);
    }
  };

  const refreshHospital = async (id: string) => {
    try {
      const data = await ApiClient.getHospital(id);
      setHospitals((prev) => ({ ...prev, [id]: data }));
    } catch (error) {
      console.error(`Failed to fetch hospital ${id}`, error);
    }
  };

  const refreshHospitals = async () => {
    try {
      const data = await ApiClient.getHospitals();
      const map: Record<string, Hospital> = {};
      data.forEach((h) => (map[h.id] = h));
      setHospitals((prev) => ({ ...prev, ...map }));
    } catch (error) {
      console.error("Failed to fetch hospitals", error);
    }
  };

  // Add log entry helper
  const addLog = useCallback((level: LogEntry["level"], message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      level,
      message,
    };
    setLogs((prev) => [...prev.slice(-99), newLog]);
  }, []);

  // Handle simulation events
  const handleSimulationEvent = useCallback(
    (event: SimulationEvent) => {
      const { type, data } = event;

      // Persist to Supabase (non-blocking)
      if (persistenceEnabled) {
        handleSimulationEventPersistence(event).catch(console.error);
      }

      switch (type) {
        case "SURGE_TRIGGERED":
          addLog(
            "WARN",
            `⚡ SURGE: ${data.count} patients injected into the system`,
          );
          break;
        case "DISTRESS_DETECTED":
          addLog(
            "CRITICAL",
            `🚨 DISTRESS: ${getShortPatientId(data.patientId)} escalated from priority ${data.oldPriority} → ${data.newPriority}`,
          );
          break;
        case "PATIENT_ADMITTED":
          addLog(
            "SUCCESS",
            `✅ ${getShortPatientId(data.patientId)} admitted to ${data.hospitalName} (${data.department})`,
          );
          break;
        case "PATIENT_DISCHARGED":
          addLog(
            "INFO",
            `📤 ${getShortPatientId(data.patientId)} discharged from ${data.hospitalName}`,
          );
          setProcessedCount((prev) => prev + 1);
          break;
        case "REDIRECTION":
          addLog(
            "INFO",
            `🔄 ${getShortPatientId(data.patientId)} redirected: ${data.fromHospital} → ${data.toHospital}`,
          );
          break;
        case "STAFF_DROPOUT":
          addLog(
            "WARN",
            `👨‍⚕️ Staff dropout: ${data.percent}% reduction in staff`,
          );
          break;
        case "SURGE_DETECTED":
          console.log("🚨 SURGE_DETECTED event received:", data);
          addLog(
            "WARN",
            `🚨 SURGE DETECTED! Rate: ${data.rate}/min - Scaling to 140%`,
          );
          toast.warning("🚨 Surge Detected!", {
            description: `Rate: ${data.rate}/min • Hospitals scaling to 140% capacity`,
            duration: 5000,
          });
          console.log("✅ Surge toast notification triggered");
          break;
        case "SURGE_ENDED":
          console.log("🟢 SURGE_ENDED event received:", data);
          addLog(
            "INFO",
            `🟢 Surge ended. Rate: ${data.rate}/min - Restored to baseline`,
          );
          toast.success("🟢 Surge Ended", {
            description: `Rate: ${data.rate}/min • Hospitals restored to baseline`,
            duration: 4000,
          });
          console.log("✅ Surge ended toast notification triggered");
          break;
      }
    },
    [addLog, persistenceEnabled],
  );

  // Handle state changes from simulation
  const handleStateChange = useCallback((state: SimulationState) => {
    setSimStats(state.stats);

    // Update hospitals from simulation engine
    const hospitalMap: Record<string, Hospital> = {};
    state.hospitals.forEach((h) => {
      hospitalMap[h.id] = h;
    });
    setHospitals(hospitalMap);

    // Calculate avg wait time estimate
    if (state.stats.totalDoctorsActive > 0) {
      const estimate = Math.round(
        (state.stats.totalPatientsWaiting / state.stats.totalDoctorsActive) * 5,
      );
      setAvgWaitTime(estimate);
    }
  }, []);

  // Handle Run/Pause Simulation
  const handleRunToggle = useCallback(async () => {
    if (!engineRef.current) return;

    const newState = !isRunning;

    if (newState) {
      setIsLoading(true);
      addLog("SYSTEM", "🚀 Initializing simulation with 10 hospitals...");

      // Initialize with 10 hospitals
      engineRef.current.init(10);

      // Persist hospitals to database BEFORE starting simulation
      if (persistenceEnabled) {
        const hospitals = engineRef.current.getState().hospitals;
        addLog("SYSTEM", "💾 Persisting hospitals to database...");
        await persistHospitals(hospitals);
        addLog(
          "SUCCESS",
          `✅ ${hospitals.length} hospitals persisted to database`,
        );
      }

      // Now start the simulation
      engineRef.current.start();

      // Start periodic sync to Supabase (every 10 seconds)
      if (persistenceEnabled) {
        startPeriodicSync(
          () => engineRef.current?.getState().hospitals || [],
          () =>
            engineRef.current?.getState().stats || {
              totalHospitals: 0,
              totalPatientsWaiting: 0,
              totalDoctorsActive: 0,
              surgeActive: false,
              recentRedirections: 0,
            },
          10000,
        );
        persistSimulationLog(
          "SYSTEM",
          "Simulation started with Supabase persistence",
        );
      }

      setIsRunning(true);
      addLog("SUCCESS", "✅ Simulation started with 10 hospitals");

      const stats = engineRef.current.getFormattedStats();
      addLog("INFO", `📊 Stats: ${stats.totalHospitals} hospitals ready`);

      setIsLoading(false);
    } else {
      engineRef.current.pause();
      stopPeriodicSync();
      if (persistenceEnabled) {
        persistSimulationLog("SYSTEM", "Simulation paused");
      }
      setIsRunning(false);
      addLog("SYSTEM", "⏸️ Simulation paused");
    }
  }, [isRunning, addLog, persistenceEnabled]);

  // Handle Reset
  const handleReset = useCallback(async () => {
    if (!engineRef.current) return;

    setIsLoading(true);
    addLog("SYSTEM", "🔄 Resetting simulation...");

    // Stop sync and flush logs
    stopPeriodicSync();
    await forceFlushLogs();

    // Clear Supabase data if persistence is enabled
    if (persistenceEnabled) {
      addLog("SYSTEM", "🗑️ Clearing database records...");
      await clearSimulationData();
    }

    engineRef.current.reset();

    setIsRunning(false);
    setPatientSurge(2.0);
    setStaffDropout(0);
    setDistressFreq("LOW");
    setLogs([]);
    setSimStats(null);
    setProcessedCount(0);
    setAvgWaitTime(0);
    // NOTE: We do NOT reset redirectionEvents or totalRedirections
    // They should persist across simulation resets to maintain historical data

    addLog("SUCCESS", "✅ Simulation reset complete (redirections preserved)");

    setIsLoading(false);
  }, [addLog, persistenceEnabled]);

  // Trigger Surge
  const triggerSurge = useCallback(
    (count?: number) => {
      if (!engineRef.current) return;

      if (!isRunning) {
        console.warn("Start the simulation first before triggering a surge.");
        return;
      }

      const surgeCount = count ?? Math.max(Math.floor(patientSurge * 15), 10);
      addLog("WARN", `⚡ Triggering patient surge: ${surgeCount} patients...`);

      engineRef.current.triggerSurge(surgeCount);
    },
    [isRunning, patientSurge, addLog],
  );

  // Flood Hospitals - inject many patients into a few hospitals to trigger redirections
  const floodHospitals = useCallback(async () => {
    try {
      addLog(
        "WARN",
        ` Flooding hospitals with patients to trigger redirections...`,
      );
      const response = await fetch(
        `http://localhost:9090/api/simulation/flood`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientsPerHospital: 200,
            hospitalsToFlood: 3,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        addLog("INFO", ` ${data.message}`);
        addLog("INFO", ` Flooded: ${data.hospitalsFlooded.join(", ")}`);
      } else {
        addLog("CRITICAL", ` ${data.message}`);
      }
    } catch (err) {
      addLog("CRITICAL", ` Failed to flood hospitals: ${err}`);
    }
  }, [addLog]);

  // Trigger Staff Dropout
  const triggerStaffDropout = useCallback(
    (percent: number) => {
      if (!engineRef.current || !isRunning) return;

      if (percent > 0) {
        engineRef.current.triggerStaffDropout(percent);
        addLog("WARN", ` Manual staff dropout triggered: ${percent}%`);
      }
    },
    [isRunning, addLog],
  );

  // Initialize simulation engine
  useEffect(() => {
    engineRef.current = new SimulationEngine(
      handleSimulationEvent,
      handleStateChange,
    );
    addLog("SYSTEM", "🏥 Frontend Simulation Engine initialized");

    // Load historical logs from Supabase
    if (persistenceEnabled) {
      loadHistoricalLogs(30)
        .then((historicalLogs) => {
          if (historicalLogs.length > 0) {
            setLogs((prev) =>
              [...historicalLogs.reverse(), ...prev].slice(-100),
            );
            addLog(
              "SYSTEM",
              `📜 Loaded ${historicalLogs.length} historical logs from database`,
            );
          }
        })
        .catch(console.error);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.reset();
      }
      stopPeriodicSync();
      forceFlushLogs();
    };
  }, []);

  // Update engine config when controls change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig({
        patientSurgeMultiplier: patientSurge,
        staffDropoutPercent: staffDropout,
        distressFrequency: distressFreq,
        policyLogic: policyLogic,
      });
    }
  }, [patientSurge, staffDropout, distressFreq, policyLogic]);

  useEffect(() => {
    // Initial fetch only if simulation is not running
    if (!isRunning) {
      refreshStats();
      refreshHospitals();
    }
  }, [isRunning]);

  useEffect(() => {
    // Subscribe to city-wide statistics updates (only when simulation is NOT running)
    socketService.subscribe("/topic/stats", (newStats: CityStats) => {
      // Use ref to get current value, not captured value
      if (!isRunningRef.current) {
        setStats(newStats);
      }
    });

    // Subscribe to individual hospital updates (only when simulation is NOT running)
    socketService.subscribe("/topic/hospital", (newHospital: Hospital) => {
      // Use ref to get current value, not captured value
      if (!isRunningRef.current) {
        setHospitals((prev) => ({ ...prev, [newHospital.id]: newHospital }));
      }
    });

    // Subscribe to real-time system events (patient admissions, surges, distress, etc.)
    socketService.subscribe("/topic/events", (event: any) => {
      console.log("🔔 Real-time event received:", event);

      // Log surge-specific events with more detail
      if (event.type === "SURGE_DETECTED" || event.type === "SURGE_ENDED") {
        console.log(`📊 Surge Event Details:`, {
          type: event.type,
          rate: event.rate,
          scalingFactor: event.scalingFactor,
          message: event.message,
          timestamp: new Date(event.timestamp).toLocaleTimeString(),
        });
      }

      // You can dispatch events to EventStream component or global state here
      // Example: Add to event log, show toast notifications, etc.
      if (event.type === "SURGE_TRIGGERED") {
        console.warn(`SURGE: ${event.count} patients injected`);
        addLog("WARN", `⚡ Surge: ${event.count} patients injected`);
      } else if (event.type === "HOSPITALS_FLOODED") {
        console.warn(` FLOODED: ${event.hospitalsFlooded?.join(", ")}`);
        addLog(
          "WARN",
          `Flooded ${event.hospitalsFlooded?.length || 0} hospitals with ${event.totalPatients} patients`,
        );
      } else if (event.type === "DISTRESS_DETECTED") {
        console.error(
          ` DISTRESS: ${getShortPatientId(event.patientId)} at priority ${event.newPriority}`
        );
        addLog(
          "CRITICAL",
          ` Distress: Patient ${getShortPatientId(event.patientId)} at priority ${event.newPriority}`
        );
      } else if (event.type === "PATIENT_ADMITTED") {
        console.info(
          ` ADMITTED: ${getShortPatientId(event.patientId)} to ${event.hospitalId}`
        );
        addLog(
          "INFO",
          ` Admitted: Patient ${getShortPatientId(event.patientId)} to ${event.hospitalName || event.hospitalId}`
        );
      } else if (event.type === "PATIENT_REDIRECTED") {
        const sourceName = event.sourceHospitalName || event.sourceHospitalId;
        const targetName = event.targetHospitalName || event.targetHospitalId;
        console.info(
          `🔄 REDIRECT: ${getShortPatientId(event.patientId)} moved ${sourceName} -> ${targetName}`,
        );
        console.log("Full redirection event:", event);
        addLog(
          "SUCCESS",
          ` Redirected: Patient ${getShortPatientId(event.patientId)} from ${sourceName} → ${targetName}`
        );
        // Add new redirection event to the beginning, keep all events (no limit)
        setRedirectionEvents((prev) => [event, ...prev]);
        // Increment total redirections counter
        setTotalRedirections((prev) => prev + 1);
      } else if (event.type === "TREATMENT_STARTED") {
        setActiveTreatments((prev) => {
          const hospitalId = event.hospitalId;
          const current = prev[hospitalId] || [];
          return {
            ...prev,
            [hospitalId]: [...current, event],
          };
        });
      } else if (event.type === "TREATMENT_COMPLETED") {
        setActiveTreatments((prev) => {
          const hospitalId = event.hospitalId;
          const current = prev[hospitalId] || [];
          return {
            ...prev,
            [hospitalId]: current.filter(
              (t: any) => t.patientId !== event.patientId,
            ),
          };
        });
      }
    });

    return () => {
      // Clean up subscriptions when component unmounts
      socketService.unsubscribe("/topic/stats");
      socketService.unsubscribe("/topic/hospital");
      socketService.unsubscribe("/topic/events");
    };
  }, [socketService]);

  return (
    <SimulationContext.Provider
      value={{
        stats,
        hospitals,
        redirectionEvents,
        activeTreatments,
        totalRedirections,
        isConnected,
        refreshStats,
        refreshHospital,

        // Simulation engine state
        isRunning,
        isLoading,
        logs,
        simStats,
        processedCount,
        avgWaitTime,
        persistenceEnabled,

        // Simulation engine controls
        handleRunToggle,
        handleReset,
        triggerSurge,
        triggerStaffDropout,
        floodHospitals,

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
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
