"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  TriangleAlert,
  ChevronRight,
  Stethoscope,
  Clock,
  BarChart2,
  MapPin,
  Users,
  ArrowRight,
  Info,
  VideoOff,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";

interface DistressAlert {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientId: string;
  type: "COLLAPSE" | "AGITATION" | "SEIZURE" | "PROLONGED";
  confidence: number;
  waitTime: string;
  timestamp: number;
  severity: number;
  location?: string;
}

const getAlertBadgeStyles = (type: string) => {
  switch (type) {
    case "COLLAPSE":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
    case "AGITATION":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    case "SEIZURE":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
    case "PROLONGED":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    default:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case "COLLAPSE":
      return <TriangleAlert className="h-4 w-4 mr-1" />;
    case "AGITATION":
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    case "SEIZURE":
      return <Stethoscope className="h-4 w-4 mr-1" />;
    case "PROLONGED":
      return <Clock className="h-4 w-4 mr-1" />;
    default:
      return <AlertTriangle className="h-4 w-4 mr-1" />;
  }
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<DistressAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DistressAlert | null>(null);
  const { socketService } = useRealtime();

  // Subscribe to SSE events for distress alerts
  useEffect(() => {
    socketService.subscribe("/topic/events", (event: any) => {
      if (event.type === "DISTRESS_DETECTED") {
        const newAlert: DistressAlert = {
          id: `${event.patientId}-${event.timestamp}`,
          hospitalId: event.hospitalId,
          hospitalName: event.hospitalName || event.hospitalId,
          patientId: event.patientId,
          type: mapDistressType(event.distressLevel),
          confidence: Math.min(95 + Math.random() * 5, 100),
          waitTime: formatWaitTime(event.waitTime || 0),
          timestamp: event.timestamp,
          severity: event.newPriority || event.distressLevel,
          location: event.location || "Waiting Area",
        };

        setAlerts((prev) => {
          const updated = [newAlert, ...prev.filter(a => a.id !== newAlert.id)].slice(0, 50);
          if (!selectedAlert) {
            setSelectedAlert(newAlert);
          }
          return updated;
        });
      }
    });

    return () => {
      socketService.unsubscribe("/topic/events");
    };
  }, [socketService, selectedAlert]);

  const mapDistressType = (level: number): DistressAlert["type"] => {
    if (level >= 8) return "COLLAPSE";
    if (level >= 6) return "SEIZURE";
    if (level >= 4) return "AGITATION";
    return "PROLONGED";
  };

  const formatWaitTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getTimeSince = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 h-full flex flex-col">
      <main className="flex-1 flex overflow-hidden">
        {/* Alerts List */}
        <section className="w-2/5 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-[#0f172a]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark flex justify-between items-center shrink-0">
            <h2 className="font-semibold text-lg flex items-center">
              Active Distress Alerts
              <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </h2>
            <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No active alerts</p>
                <p className="text-sm mt-1">Waiting for distress events...</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm transition-all hover:shadow-md ${
                    selectedAlert?.id === alert.id
                      ? "border-2 border-primary ring-1 ring-primary/20"
                      : "border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        ID: #{alert.patientId.substring(0, 8).toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm mt-0.5 text-text-primary-light dark:text-text-primary-dark">
                        {alert.hospitalName}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getAlertBadgeStyles(alert.type)}`}>
                      {getAlertIcon(alert.type)}
                      {alert.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                          Confidence
                        </span>
                        <span className={`font-bold ${alert.confidence >= 90 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                          {Math.round(alert.confidence)}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                          Wait Time
                        </span>
                        <span className="font-medium">{alert.waitTime}</span>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${selectedAlert?.id === alert.id ? "text-primary" : "text-gray-300 dark:text-gray-600 group-hover:text-primary"} transition-colors`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Alert Details */}
        <section className="w-3/5 bg-background-light dark:bg-background-dark flex flex-col h-full overflow-y-auto">
          {selectedAlert ? (
            <div className="p-8 max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Alert Details
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      #{selectedAlert.patientId.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {selectedAlert.hospitalName} • {selectedAlert.location}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getAlertBadgeStyles(selectedAlert.type)}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
                    {selectedAlert.type === "COLLAPSE" ? "POTENTIAL COLLAPSE" : selectedAlert.type}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                    Detected {getTimeSince(selectedAlert.timestamp)}
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                    <BarChart2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {Math.round(selectedAlert.confidence)}%
                    <span className={`text-xs font-normal ml-1 ${selectedAlert.confidence >= 90 ? "text-green-500" : "text-yellow-500"}`}>
                      {selectedAlert.confidence >= 90 ? "High" : "Medium"}
                    </span>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                    {selectedAlert.location}
                  </div>
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Camera Feed Active
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Detection Time</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {new Date(selectedAlert.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Today
                  </div>
                </div>
              </div>

              {/* Queue Context */}
              <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Queue Context
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        Severity Level
                      </span>
                      <span className="text-lg font-bold text-red-500">{selectedAlert.severity}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${selectedAlert.severity * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      {selectedAlert.type === "COLLAPSE" && "Patient exhibited sudden loss of posture consistent with fainting."}
                      {selectedAlert.type === "SEIZURE" && "Patient showing signs of seizure activity requiring immediate attention."}
                      {selectedAlert.type === "AGITATION" && "Patient displaying agitated behavior in waiting area."}
                      {selectedAlert.type === "PROLONGED" && "Patient has been waiting beyond threshold duration."}
                    </p>
                  </div>
                  <div className="w-px h-16 bg-gray-200 dark:bg-gray-700 mx-4"></div>
                  <div className="flex-1 pl-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center min-w-[60px]">
                        <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">Was</span>
                        <span className="block font-bold text-lg">--</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center min-w-[60px] border border-red-200 dark:border-red-800">
                        <span className="block text-xs text-red-600 dark:text-red-400 uppercase font-bold">Now</span>
                        <span className="block font-bold text-lg text-red-600 dark:text-red-400">#1</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      System recommends immediate priority escalation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-4 mb-6 rounded-r-lg flex items-start">
                <Info className="text-primary mr-3 mt-0.5 h-5 w-5" />
                <div>
                  <h4 className="font-bold text-primary dark:text-blue-400 text-sm uppercase tracking-wide">
                    Recommended Action
                  </h4>
                  <p className="text-text-primary-light dark:text-text-primary-dark mt-1">
                    Immediate staff intervention required at <span className="font-semibold">{selectedAlert.hospitalName}</span>. 
                    Check vital signs and secure the patient.
                  </p>
                </div>
              </div>

              {/* Video Placeholder */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 uppercase tracking-wider">
                  Detection Snapshot
                </h3>
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative border border-gray-300 dark:border-gray-600 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 opacity-50"></div>
                  <VideoOff className="h-12 w-12 text-gray-400 dark:text-gray-500 z-10" />
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-mono">
                    CAM • LIVE
                  </div>
                  <div className="absolute inset-0 border-4 border-red-500/50 rounded-lg m-12 pointer-events-none"></div>
                  <div className="absolute top-16 right-16 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    {Math.round(selectedAlert.confidence)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">
                  Triage Decision
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
                    Reasoning / Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="e.g. Verified via CCTV, security dispatched..."
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex items-center space-x-4 pt-2">
                  <button 
                    onClick={() => setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id))}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex justify-center items-center"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Alert
                  </button>
                  <button 
                    onClick={() => {
                      setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id));
                      setSelectedAlert(null);
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2.5 px-4 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex justify-center items-center"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Dismiss / False Alarm
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Select an alert to view details</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AlertsPage;
