"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CityStats, Hospital } from "@/lib/types";
import { SocketService } from "@/lib/socket-service";
import * as ApiClient from "@/lib/api-client";

interface SimulationContextType {
  stats: CityStats | null;
  hospitals: Record<string, Hospital>;
  isConnected: boolean;
  refreshStats: () => Promise<void>;
  refreshHospital: (id: string) => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [hospitals, setHospitals] = useState<Record<string, Hospital>>({});
  const [socketService] = useState(() => new SocketService());

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

  useEffect(() => {
    // Initial fetch
    refreshStats();

    // Setup Socket
    socketService.connect();

    socketService.subscribe("/topic/stats", (newStats: CityStats) => {
      setStats(newStats);
    });

    // Subscribing to a generic hospital topic (actual topic structure may vary)
    socketService.subscribe("/topic/hospital", (newHospital: Hospital) => {
        setHospitals((prev) => ({ ...prev, [newHospital.id]: newHospital }));
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
