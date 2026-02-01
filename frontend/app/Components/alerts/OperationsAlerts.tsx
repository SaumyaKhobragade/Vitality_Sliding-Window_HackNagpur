"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert, Stethoscope, Info, Shuffle } from "lucide-react";
import * as ApiClient from "@/lib/api-client";
import { DistressEvent, RedirectionDecision } from "@/lib/types";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";
import { useSimulation } from "@/app/Components/Context/SimulationContext";
import { formatPatientId, getShortPatientId } from "@/lib/utils";

interface UnifiedAlert {
    id: string;
    type: "DISTRESS" | "REDIRECTION" | "SYSTEM";
    title: string;
    description: string;
    timestamp: number;
    severity: "critical" | "warning" | "info";
}

const OperationsAlerts = () => {
    const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const { socketService } = useRealtime();
    const { logs, isRunning } = useSimulation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [distress, redirections] = await Promise.all([
                    ApiClient.getDistressEvents(),
                    ApiClient.getRedirectionDecisions(),
                ]);

                const mappedDistress: UnifiedAlert[] = distress.map((d: DistressEvent) => ({
                    id: d.id,
                    type: "DISTRESS",
                    title: `${d.type}: ${d.locationDetail || "Unknown Location"}`,
                    description: `Severity ${d.severityScore}. ${d.recommendedAction || ""}`,
                    timestamp: new Date(d.detectedAt).getTime(),
                    severity: d.severityScore > 7 ? "critical" : "warning",
                }));

                const mappedRedirections: UnifiedAlert[] = redirections.map((r: RedirectionDecision) => ({
                    id: r.id,
                    type: "REDIRECTION",
                    title: `Redirection: ${formatPatientId(r.patientId)}`,
                    description: `${r.reason}. Priority: ${r.decisionType}`,
                    timestamp: new Date(r.time).getTime(),
                    severity: r.decisionType === "safe" ? "info" : "warning",
                }));

                const merged = [...mappedDistress, ...mappedRedirections].sort(
                    (a, b) => b.timestamp - a.timestamp
                );

                setAlerts(merged.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Only poll if simulation is not running
        const interval = !isRunning ? setInterval(fetchData, 15000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    // Subscribe to real-time events when simulation is running
    useEffect(() => {
        if (!isRunning) return;

        socketService.subscribe("/topic/events", (event: any) => {
            let newAlert: UnifiedAlert | null = null;

            if (event.type === "DISTRESS_DETECTED") {
                newAlert = {
                    id: `${event.patientId}-${event.timestamp}`,
                    type: "DISTRESS",
                    title: `Distress Alert: ${getShortPatientId(event.patientId)}`,
                    description: `Priority escalated to ${event.newPriority}. Hospital: ${event.hospitalName || event.hospitalId}`,
                    timestamp: event.timestamp || Date.now(),
                    severity: event.newPriority >= 8 ? "critical" : "warning",
                };
            } else if (event.type === "REDIRECTION") {
                newAlert = {
                    id: `${event.patientId}-${event.timestamp}`,
                    type: "REDIRECTION",
                    title: `Redirection: ${getShortPatientId(event.patientId)}`,
                    description: `${event.fromHospital} → ${event.toHospital}`,
                    timestamp: event.timestamp || Date.now(),
                    severity: "info",
                };
            }

            if (newAlert) {
                setAlerts(prev => {
                    const filtered = prev.filter(a => a.id !== newAlert!.id);
                    return [newAlert!, ...filtered].slice(0, 5);
                });
            }
        });

        return () => {
            socketService.unsubscribe("/topic/events");
        };
    }, [socketService, isRunning]);

    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const getIcon = (alert: UnifiedAlert) => {
        switch (alert.type) {
            case "DISTRESS":
                return <CircleAlert className="text-red-500 h-5 w-5" />;
            case "REDIRECTION":
                return <Shuffle className="text-purple-500 h-5 w-5" />;
            default:
                return <Info className="text-gray-400 h-5 w-5" />;
        }
    };

    const getStyles = (alert: UnifiedAlert) => {
        switch (alert.severity) {
            case "critical":
                return "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30";
            case "warning":
                return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30";
            default:
                return "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30";
        }
    };

    return (
        <Card className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Operations Alerts
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                {loading && <div className="text-center text-gray-500">Loading alerts...</div>}
                {!loading && alerts.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No active alerts</div>
                )}
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-3 border rounded-lg flex gap-3 ${getStyles(alert)}`}
                    >
                        <div className="mt-1">{getIcon(alert)}</div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {alert.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {alert.description}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2">
                                {getTimeAgo(alert.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="ghost"
                className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
                View All Notifications
            </Button>
        </Card>
    );
};

export default OperationsAlerts;
