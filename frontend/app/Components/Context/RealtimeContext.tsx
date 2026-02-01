"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SseService } from "@/lib/sse-service";

interface RealtimeContextType {
  socketService: SseService;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const [socketService] = useState(() => new SseService());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.onConnectCallback = () => setIsConnected(true);
    socketService.onDisconnectCallback = () => setIsConnected(false);

    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [socketService]);

  return (
    <RealtimeContext.Provider value={{ socketService, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};
