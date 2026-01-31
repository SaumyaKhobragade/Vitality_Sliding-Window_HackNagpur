"use client";

import { useState } from "react";
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
import { Patient, Treatment, StatCard } from "@/lib/types";
import { PatientContextMenu } from "@/app/Components/dashboard/PatientContextMenu";
import { ConfirmationDialog } from "@/app/Components/dashboard/ConfirmationDialog";
import { DataTooltip } from "@/app/Components/dashboard/DataTooltip";
import { SuccessToast } from "@/app/Components/dashboard/SuccessToast";

// Hardcoded data
const patientsData: Patient[] = [
    {
        id: "#8X29-A1",
        baseSeverity: 9,
        arrivalTime: Date.now() - 72 * 60000,
        targetHospitalId: "Hosp-A",
        distressScore: 85,
        treating: false,
        dynamicPriority: 98.5,
        severity: 9,
        waitTime: "72 min",
        status: "Nearing Threshold",
        priorityScore: 98.5,
    },
    {
        id: "#9Y33-B2",
        baseSeverity: 7,
        arrivalTime: Date.now() - 45 * 60000,
        targetHospitalId: "Hosp-A",
        distressScore: 70,
        treating: false,
        dynamicPriority: 82.1,
        severity: 7,
        waitTime: "45 min",
        status: "Stable",
        priorityScore: 82.1,
    },
    {
        id: "#3K11-C9",
        baseSeverity: 8,
        arrivalTime: Date.now() - 38 * 60000,
        targetHospitalId: "Hosp-B",
        distressScore: 65,
        treating: false,
        dynamicPriority: 21.2,
        severity: 8,
        waitTime: "38 min",
        status: "Stable",
        priorityScore: 21.2,
    },
];

const treatmentsData: Treatment[] = [
    {
        id: "1",
        patientId: "#4421",
        type: "Trauma",
        doctor: "Dr. Emily Chen",
        location: "Surgery Unit A",
        elapsed: "2h 15m elapsed",
        progress: 75,
        icon: <PersonStanding className="h-5 w-5" />,
        color: "purple",
    },
    {
        id: "2",
        patientId: "#3120",
        type: "Cardiac",
        doctor: "Dr. James Wilson",
        location: "ICU Bed 4",
        elapsed: "45m elapsed",
        progress: 30,
        icon: <Heart className="h-5 w-5" />,
        color: "blue",
    },
    {
        id: "3",
        patientId: "#5591",
        type: "Orthopedic",
        doctor: "Dr. Sarah W.",
        location: "Exam Room 2",
        elapsed: "10m elapsed",
        progress: 15,
        icon: <Stethoscope className="h-5 w-5" />,
        color: "teal",
    },
];

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

const QueueDetailsPage = () => {
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

    const handlePatientAction = (action: string, patientId: string) => {
        if (action === "discharge" || action === "fast-track") {
            setConfirmDialog({ open: true, action, patientId });
        } else {
            // Handle other actions directly
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
                <span className="font-mono font-medium">{row.getValue("id")}</span>
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
                const waitTime = row.getValue("waitTime") as string;
                const isLong = waitTime.includes("72");
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
            value: "45",
            subtitle: "/ 50",
            badge: {
                text: "High Load",
                color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
            },
            content: (
                <>
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <span className="text-4xl font-bold tracking-tight">45</span>
                            <span className="text-lg text-muted-foreground font-medium">
                                / 50
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Oldest Wait
                            </p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center justify-end gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                72 mins
                            </p>
                        </div>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-accent overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-blue-500 via-amber-400 to-red-500"
                            style={{ width: "90%" }}
                        ></div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Current load is 90% of maximum safe capacity.
                    </p>
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
                            <span className="text-3xl font-bold">12</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-sm text-muted-foreground">Idle</span>
                            </div>
                            <span className="text-3xl font-bold">2</span>
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
                                <h1 className="text-2xl font-bold">Avicena Clinic</h1>
                                <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    SURGE
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Real-time operational view · Last updated: 1 min ago
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
                                    {card.title === "Staff Availability" && (
                                        <button className="text-sm text-primary hover:text-primary/80 font-medium">
                                            Manage Roster
                                        </button>
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
                                data={patientsData}
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
                            {treatmentsData.map((treatment) => (
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
                                                    Patient {treatment.patientId} ({treatment.type})
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
                                    {treatment.id === "1" && (
                                        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            <span>Prep</span>
                                            <span>Surgery</span>
                                            <span>Recovery</span>
                                        </div>
                                    )}
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
                description={`Are you sure you want to ${confirmDialog.action} patient ${confirmDialog.patientId}?`}
                highlightedText={confirmDialog.patientId}
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

export default QueueDetailsPage;
