"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CityStats, Hospital } from "@/lib/types";
import { SocketService } from "@/lib/socket-service";
import * as ApiClient from "@/lib/api-client";

interface SimulationContextType {
  stats: CityStats | null;
  hospitals: Record<string, Hospital>;
  redirectionEvents: any[];
  activeTreatments: Record<string, any[]>;
  totalRedirections: number;
  isConnected: boolean;
  refreshStats: () => Promise<void>;
  refreshHospital: (id: string) => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined,
);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [hospitals, setHospitals] = useState<Record<string, Hospital>>({});
  const [redirectionEvents, setRedirectionEvents] = useState<any[]>([]);
  const [totalRedirections, setTotalRedirections] = useState(0);
  const [activeTreatments, setActiveTreatments] = useState<
    Record<string, any[]>
  >({}); // Map<HospitalId, Treatment[]>
  const [socketService] = useState(() => new SocketService());

  const refreshStats = async () => {
    try {
      const data = await ApiClient.getCityStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch initial stats", error);
    }
  };

  const refreshHospitals = async () => {
    try {
      const data = await ApiClient.getHospitals();
      const hospitalMap = data.reduce((acc, h) => ({ ...acc, [h.id]: h }), {});
      setHospitals(hospitalMap);
    } catch (error: any) {
      console.warn("Could not fetch hospitals:", error);
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

  useEffect(() => {
    // Initial fetch
    refreshStats();
    refreshHospitals();

    // Setup Socket
    socketService.connect();

    // Subscribe to city-wide statistics updates (every 2 seconds)
    socketService.subscribe("/topic/stats", (newStats: CityStats) => {
      setStats(newStats);
    });

    // Subscribe to individual hospital updates
    socketService.subscribe("/topic/hospital", (newHospital: Hospital) => {
      setHospitals((prev) => ({ ...prev, [newHospital.id]: newHospital }));
    });

    // Subscribe to real-time system events (patient admissions, surges, distress, etc.)
    socketService.subscribe("/topic/events", (event: any) => {
      console.log("🔔 Real-time event received:", event);

      // You can dispatch events to EventStream component or global state here
      // Example: Add to event log, show toast notifications, etc.
      if (event.type === "SURGE_TRIGGERED") {
        console.warn(`⚠️ SURGE: ${event.count} patients injected`);
      } else if (event.type === "DISTRESS_DETECTED") {
        console.error(
          `🚨 DISTRESS: Patient ${event.patientId} at priority ${event.newPriority}`,
        );
      } else if (event.type === "PATIENT_ADMITTED") {
        console.info(
          `✅ ADMITTED: Patient ${event.patientId} to ${event.hospitalId}`,
        );
      } else if (event.type === "PATIENT_REDIRECTED") {
        console.info(
          `🔄 REDIRECT: ${event.patientId} moved ${event.sourceHospitalId} -> ${event.targetHospitalId}`,
        );
        setRedirectionEvents((prev) => [event, ...prev].slice(0, 100)); // Keep last 100
        setTotalRedirections((prev) => prev + 1); // Track total count
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
      socketService.disconnect();
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
        isConnected: socketService.isConnected(),
        refreshStats,
        refreshHospital,
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
