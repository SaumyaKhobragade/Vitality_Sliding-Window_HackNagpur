"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Building2,
    TrendingUp,
    Bell,
    Plus,
    ChevronDown,
    AlertTriangle,
    BatteryWarning,
    Activity,
    PersonStanding,
    Heart,
    Stethoscope,
    Zap,
    UserX,
    FileText,
    Navigation,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/app/Components/Common/DataTable";
import { SearchBar } from "@/app/Components/Common/SearchBar";
import Image from "next/image";
import { Patient, Treatment, StatCard, TreatmentRecord, Hospital } from "@/lib/types";
import { formatPatientId, getShortPatientId } from "@/lib/utils";
import { PatientContextMenu } from "@/app/Components/dashboard/PatientContextMenu";
import { ConfirmationDialog } from "@/app/Components/dashboard/ConfirmationDialog";
import { DataTooltip } from "@/app/Components/dashboard/DataTooltip";
import { SuccessToast } from "@/app/Components/dashboard/SuccessToast";
import * as ApiClient from "@/lib/api-client";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";
import { useSimulation } from "@/app/Components/Context/SimulationContext";

// Helper functions
const getSeverityColor = (severity: number) => {
    if (severity >= 8)
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    if (severity >= 6)
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
};

const getStatusColor = (status: string) => {
    if (status === "Nearing Threshold")
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
    if (status === "Stable")
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
};

const getProgressColor = (color: string) => {
    const colors: Record<string, string> = {
        purple: "bg-purple-500",
        blue: "bg-blue-500",
        teal: "bg-teal-500",
    };
    return colors[color] || "bg-gray-500";
};

const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
        purple:
            "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300",
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300",
        teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300",
    };
    return (
        colors[color] ||
        "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300"
    );
};

const QueueDetailsContent = () => {
    const searchParams = useSearchParams();
    const hospitalId = searchParams.get("hospital");

    const [patients, setPatients] = useState<Patient[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [hospital, setHospital] = useState<Hospital | null>(null);

    // SSE context for real-time updates
    const { socketService, isConnected } = useRealtime();
    const { hospitals } = useSimulation();

    // State for dialogs and toasts
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: string;
        patientId: string;
    }>({ open: false, action: "", patientId: "" });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({
        title: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [patientsData, treatmentsData, hospitalData] = await Promise.all([
                ApiClient.getPatientQueue(hospitalId || undefined),
                ApiClient.getTreatments(hospitalId || undefined),
                hospitalId ? ApiClient.getHospital(hospitalId) : null
            ]);

            setPatients(patientsData);
            
            // Map treatments
            const mappedTreatments = treatmentsData.map(record => {
                let icon = <Stethoscope className="h-5 w-5" />;
                if (record.type === "Trauma") icon = <PersonStanding className="h-5 w-5" />;
                if (record.type === "Cardiac") icon = <Heart className="h-5 w-5" />;
                
                const start = new Date(record.startedAt).getTime();
                const diff = Math.max(0, Date.now() - start);
                const minutes = Math.floor(diff / 60000);
                const elapsed = minutes > 60 ? `${Math.floor(minutes/60)}h ${minutes%60}m elapsed` : `${minutes}m elapsed`;

                return {
                    id: record.id,
                    patientId: record.patientId, 
                    type: record.type,
                    doctor: record.doctorName,
                    location: record.location,
                    elapsed,
                    progress: record.progress,
                    icon,
                    color: record.colorCode
                };
            });
            setTreatments(mappedTreatments);
            
            if (hospitalData) setHospital(hospitalData);

        } catch (error) {
            console.error("Failed to fetch queue details", error);
        }
    }, [hospitalId]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Subscribe to SSE for real-time updates
    useEffect(() => {
        // When hospital data updates via SSE, refresh if it's our hospital
        socketService.subscribe("/topic/hospital", (updatedHospital: Hospital) => {
            if (!hospitalId || updatedHospital.id === hospitalId) {
                setHospital(updatedHospital);
                // Refetch patients when hospital updates
                fetchData();
            }
        });

        // Listen for events that might affect our queue
        socketService.subscribe("/topic/events", (event: any) => {
            if (!hospitalId || event.hospitalId === hospitalId) {
                // Refetch on patient-related events
                if (["PATIENT_ADMITTED", "PATIENT_DISCHARGED", "DISTRESS_DETECTED"].includes(event.type)) {
                    fetchData();
                }
            }
        });

        return () => {
            socketService.unsubscribe("/topic/hospital");
            socketService.unsubscribe("/topic/events");
        };
    }, [socketService, hospitalId, fetchData]);

    const handlePatientAction = (action: string, patientId: string) => {
        if (action === "discharge" || action === "fast-track") {
            setConfirmDialog({ open: true, action, patientId });
        } else {
            console.log(`${action} for patient ${patientId}`);
        }
    };

    const handleConfirmAction = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setConfirmDialog({ open: false, action: "", patientId: "" });
        setToastMessage({
            title: "Success",
            description: `Patient ${confirmDialog.action === "discharge" ? "discharged" : "fast-tracked"} successfully.`,
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Table columns
    const patientColumns: ColumnDef<Patient>[] = [
        {
            accessorKey: "id",
            header: "Patient ID",
            cell: ({ row }) => (
                <span className="font-mono font-medium">{formatPatientId(row.getValue("id") as string)}</span>
            ),
        },
        {
            accessorKey: "severity",
            header: "Severity (1-10)",
            cell: ({ row }) => {
                const severity = row.getValue("severity") as number;
                return (
                    <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getSeverityColor(severity)}`}
                    >
                        {severity}
                    </span>
                );
            },
        },
        {
            accessorKey: "waitTime",
            header: "Wait Time",
            cell: ({ row }) => {
                const arrival = row.original.arrivalTime;
                const minutes = Math.floor((Date.now() - arrival) / 60000);
                const waitTime = `${minutes} min`;
                const isLong = minutes > 60;
                return (
                    <span
                        className={`font-medium ${isLong ? "text-red-600 dark:text-red-400" : ""}`}
                    >
                        {waitTime}
                    </span>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "priorityScore",
            header: "Priority Score",
            cell: ({ row }) => (
                <span className="font-bold text-right block">
                    {row.getValue("priorityScore")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <PatientContextMenu
                    patientName={`Patient ${row.getValue("id")}`}
                    patientInitials="PT"
                    patientRole="Emergency"
                    actions={[
                        {
                            type: "fast-track",
                            label: "Fast-track",
                            icon: <Zap className="h-4 w-4" />,
                            onAction: () =>
                                handlePatientAction("fast-track", row.getValue("id")),
                        },
                        {
                            type: "redirect",
                            label: "Redirect",
                            icon: <Navigation className="h-4 w-4" />,
                            onAction: () =>
                                handlePatientAction("redirect", row.getValue("id")),
                        },
                        {
                            type: "audit-log",
                            label: "View Audit Log",
                            icon: <FileText className="h-4 w-4" />,
                            onAction: () => handlePatientAction("audit", row.getValue("id")),
                        },
                        {
                            type: "discharge",
                            label: "Discharge",
                            icon: <UserX className="h-4 w-4" />,
                            variant: "destructive",
                            onAction: () =>
                                handlePatientAction("discharge", row.getValue("id")),
                        },
                    ]}
                />
            ),
        },
    ];

    // Stats cards data
    const statsCards: StatCard[] = [
        {
            title: "Queue Capacity",
            value: patients.length.toString(),
            subtitle: hospital ? `/ ${hospital.maxCapacity}` : "/ --",
            badge: {
                text: "Load",
                color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            },
            content: (
                <>
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <span className="text-4xl font-bold tracking-tight">{patients.length}</span>
                            <span className="text-lg text-muted-foreground font-medium">
                                {hospital ? `/ ${hospital.maxCapacity}` : ""}
                            </span>
                        </div>
                    </div>
                    {hospital && hospital.maxCapacity > 0 && (
                    <div className="relative h-3 w-full rounded-full bg-accent overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-blue-500 via-amber-400 to-red-500"
                            style={{ width: `${Math.min((patients.length / hospital.maxCapacity) * 100, 100)}%` }}
                        ></div>
                    </div>
                    )}
                </>
            ),
        },
        {
            title: "Staff Availability",
            value: "",
            content: (
                <>
                    <div className="flex items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                                <span className="text-sm text-muted-foreground">Active</span>
                            </div>
                            <span className="text-3xl font-bold">{hospital?.activeDoctorCount || "--"}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-sm text-muted-foreground">Idle</span>
                            </div>
                            <span className="text-3xl font-bold">--</span>
                        </div>
                        <div className="ml-auto">
                            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-3 text-center">
                                <BatteryWarning className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                                    Fatigue
                                    <br />
                                    Warning
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ),
        },
    ];

    return (
        <div className="flex h-full overflow-hidden">
            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{hospital?.name || "All Patients Queue"}</h1>
                                <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    SURGE
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Real-time operational view
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                Triage Mode:
                            </span>
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                Adaptive
                            </span>
                            <button className="ml-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                                View Reports
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
                        {statsCards.map((card, index) => (
                            <div
                                key={index}
                                className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold">{card.title}</h3>
                                    {card.badge && (
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.badge.color}`}
                                        >
                                            {card.badge.text}
                                        </span>
                                    )}
                                </div>
                                {card.content}
                            </div>
                        ))}
                    </div>

                    {/* Waiting Patients Table */}
                    <div className="mb-8 rounded-2xl bg-card shadow-sm ring-1 ring-border overflow-hidden">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <h3 className="text-lg font-bold">Waiting Patients</h3>
                        </div>
                        <div className="p-6">
                            <DataTable
                                columns={patientColumns}
                                data={patients}
                                showFilters={false}
                            />
                        </div>
                    </div>

                    {/* Active Treatments */}
                    <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Active Treatments</h3>
                            <span className="text-xs text-muted-foreground">
                                Updates live
                            </span>
                        </div>
                        <div className="space-y-6">
                            {treatments.length === 0 && <p className="text-muted-foreground text-sm">No active treatments.</p>}
                            {treatments.map((treatment) => (
                                <div key={treatment.id} className="group">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 flex items-center justify-center rounded-full ${getIconBgColor(treatment.color)}`}
                                            >
                                                {treatment.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {getShortPatientId(treatment.patientId)} ({treatment.type})
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {treatment.doctor} · {treatment.location}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {treatment.elapsed}
                                        </span>
                                    </div>
                                    <div className="relative h-2 w-full rounded-full bg-accent">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full ${getProgressColor(treatment.color)}`}
                                            style={{ width: `${treatment.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-8"></div>
                </div>
            </main>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={`Confirm ${confirmDialog.action === "discharge" ? "Discharge" : "Fast-Track"}`}
                description={`Are you sure you want to ${confirmDialog.action} ${formatPatientId(confirmDialog.patientId)}?`}
                highlightedText={formatPatientId(confirmDialog.patientId)}
                impactText="This action will update the patient queue immediately."
                confirmLabel="Confirm"
                cancelLabel="Cancel"
                onConfirm={handleConfirmAction}
                variant={
                    confirmDialog.action === "discharge" ? "destructive" : "warning"
                }
                loading={isLoading}
            />

            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50">
                    <SuccessToast
                        title={toastMessage.title}
                        description={toastMessage.description}
                        variant="success"
                        onClose={() => setShowToast(false)}
                    />
                </div>
            )}
        </div>
    );
};

const QueueDetailsPage = () => {
    return (
        <Suspense fallback={<div>Loading queue details...</div>}>
            <QueueDetailsContent />
        </Suspense>
    );
};

export default QueueDetailsPage;