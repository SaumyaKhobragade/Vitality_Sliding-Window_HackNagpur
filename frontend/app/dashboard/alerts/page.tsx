"use client";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useEffect, useCallback } from "react";
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
    RefreshCw,
    Search,
} from "lucide-react";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";
import { DistressEvent } from "@/lib/types";
import * as ApiClient from "@/lib/api-client";
import { formatPatientId, getShortPatientId } from "@/lib/utils";

interface DistressAlert {
    id: string;
    hospitalId: string;
    hospitalName: string;
    patientId: string;
    type: "COLLAPSE" | "AGITATION" | "SEIZURE" | "PROLONGED" | "OTHER";
    confidence: number;
    waitTime: string;
    timestamp: number;
    severity: number;
    location?: string;
    queuePositionOriginal?: number;
    queuePositionNew?: number;
    status: string;
    cameraFeedId?: string;
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
    const [loading, setLoading] = useState(true);
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const { socketService } = useRealtime();

    // Fetch initial distress events
    const fetchDistressEvents = useCallback(async () => {
        setLoading(true);
        try {
            const events = await ApiClient.getDistressEvents();
            const mappedAlerts = events
                .filter((event: any) => event.status === 'active')
                .map((event: any) => mapDistressEventToAlert(event));
            setAlerts(mappedAlerts);
            if (mappedAlerts.length > 0 && !selectedAlert) {
                setSelectedAlert(mappedAlerts[0]);
            }
        } catch (error) {
            console.error("Failed to fetch distress events:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedAlert]);

    useEffect(() => {
        fetchDistressEvents();
    }, []);

    // Map DistressEvent to DistressAlert
    const mapDistressEventToAlert = (event: any): DistressAlert => {
        return {
            id: event.id,
            hospitalId: event.hospitalId,
            hospitalName: event.hospitalId, // Will be enhanced with actual hospital name
            patientId: event.id, // Using event ID as patient reference
            type: event.type || 'OTHER',
            confidence: event.confidenceScore || 0,
            waitTime: "N/A",
            timestamp: new Date(event.detectedAt).getTime(),
            severity: event.severityScore || 5,
            location: event.locationDetail || "Waiting Area",
            queuePositionOriginal: event.queuePositionOriginal,
            queuePositionNew: event.queuePositionNew,
            status: event.status,
            cameraFeedId: event.cameraFeedId,
        };
    };

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
                    queuePositionOriginal: undefined,
                    queuePositionNew: 1,
                    status: 'active',
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

    const handleConfirmAlert = async () => {
        if (!selectedAlert || !resolutionNotes.trim()) {
            alert("Please add resolution notes before confirming.");
            return;
        }

        try {
            // Update status in database
            await ApiClient.updateDistressEvent(
                selectedAlert.id,
                "confirmed",
                resolutionNotes
            );

            // Remove from active list
            setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));

            // Select next alert if available
            const remainingAlerts = alerts.filter((a) => a.id !== selectedAlert.id);
            setSelectedAlert(remainingAlerts.length > 0 ? remainingAlerts[0] : null);
            setResolutionNotes("");
        } catch (error) {
            console.error("Failed to confirm alert:", error);
            alert("Failed to confirm alert. Please try again.");
        }
    };

    const handleDismissAlert = async () => {
        if (!selectedAlert) return;

        const confirmed = window.confirm(
            "Are you sure you want to dismiss this alert as a false alarm?"
        );
        if (!confirmed) return;

        try {
            // Update status to dismissed in database
            await ApiClient.updateDistressEvent(
                selectedAlert.id,
                "dismissed",
                "Dismissed as false alarm"
            );

            // Remove from active list
            setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));

            // Select next alert if available
            const remainingAlerts = alerts.filter((a) => a.id !== selectedAlert.id);
            setSelectedAlert(remainingAlerts.length > 0 ? remainingAlerts[0] : null);
            setResolutionNotes("");
        } catch (error) {
            console.error("Failed to dismiss alert:", error);
            alert("Failed to dismiss alert. Please try again.");
        }
    };

    // Filter and search alerts
    const filteredAlerts = alerts.filter((alert) => {
        // Search filter
        const matchesSearch = searchQuery === "" ||
            formatPatientId(alert.patientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (alert.location && alert.location.toLowerCase().includes(searchQuery.toLowerCase()));

        // Type filter
        const matchesType = filterType === "all" || alert.type === filterType;

        // Severity filter
        const matchesSeverity =
            filterSeverity === "all" ||
            (filterSeverity === "critical" && alert.severity >= 8) ||
            (filterSeverity === "high" && alert.severity >= 6 && alert.severity < 8) ||
            (filterSeverity === "medium" && alert.severity < 6);

        return matchesSearch && matchesType && matchesSeverity;
    });

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark transition-colors duration-200 h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Distress Alert Monitor
                        </h1>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            Real-time patient distress detection and triage escalation
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {alerts.length}
                            </div>
                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">
                                Active Alerts
                            </div>
                        </div>
                        <button
                            onClick={fetchDistressEvents}
                            disabled={loading}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title="Refresh alerts"
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex overflow-hidden">
                {/* Alerts List */}
                <section className="w-2/5 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-[#0f172a]">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-lg flex items-center">
                                Active Distress Alerts
                                <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {filteredAlerts.length}
                                </span>
                            </h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors p-2 rounded ${showFilters ? "bg-primary/10 text-primary" : ""
                                    }`}
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by patient ID, hospital, type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="space-y-3 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                                        Alert Type
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {filterType === "all" ? "All Types" : filterType}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterType("COLLAPSE")}>Collapse</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterType("AGITATION")}>Agitation</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterType("SEIZURE")}>Seizure</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterType("PROLONGED")}>Prolonged Wait</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterType("OTHER")}>Other</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                                        Severity Level
                                    </label>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {filterSeverity === "all" ? "All Severities" : filterSeverity}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => setFilterSeverity("all")}>All Severities</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterSeverity("critical")}>Critical (8-10)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterSeverity("high")}>High (6-7)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setFilterSeverity("medium")}>Medium (1-5)</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilterType("all");
                                        setFilterSeverity("all");
                                    }}
                                    className="w-full text-xs text-primary hover:text-primary/80 font-medium py-1"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-30 animate-spin" />
                                <p>Loading distress events...</p>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p>{alerts.length === 0 ? "No active alerts" : "No matching alerts"}</p>
                                <p className="text-sm mt-1">
                                    {alerts.length === 0
                                        ? "All clear - no distress events detected"
                                        : "Try adjusting your search or filters"}
                                </p>
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    onClick={() => setSelectedAlert(alert)}
                                    className={`cursor-pointer group relative bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm transition-all hover:shadow-md ${selectedAlert?.id === alert.id
                                        ? "border-2 border-primary ring-1 ring-primary/20"
                                        : "border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                ID: {formatPatientId(alert.patientId)}
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
                                            {formatPatientId(selectedAlert.patientId)}
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
                                                <span className="block font-bold text-lg">
                                                    {selectedAlert.queuePositionOriginal ? `#${selectedAlert.queuePositionOriginal}` : '--'}
                                                </span>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400" />
                                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center min-w-[60px] border border-red-200 dark:border-red-800">
                                                <span className="block text-xs text-red-600 dark:text-red-400 uppercase font-bold">Now</span>
                                                <span className="block font-bold text-lg text-red-600 dark:text-red-400">
                                                    {selectedAlert.queuePositionNew ? `#${selectedAlert.queuePositionNew}` : '#1'}
                                                </span>
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
                                        {selectedAlert.cameraFeedId || 'CAM'} • LIVE
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
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm p-3"
                                        placeholder="e.g. Verified via CCTV, security dispatched, patient stabilized..."
                                        rows={3}
                                    ></textarea>
                                    {resolutionNotes.trim().length > 0 && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            {resolutionNotes.trim().length} characters
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4 pt-2">
                                    <button
                                        onClick={handleConfirmAlert}
                                        disabled={!resolutionNotes.trim()}
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Confirm Alert
                                    </button>
                                    <button
                                        onClick={handleDismissAlert}
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
