"use client";

import { useState } from "react";
import {
    NotificationPopover,
    type Notification,
} from "@/app/Components/dashboard/NotificationPopover";
import {
    HospitalSelector,
    type Hospital,
} from "@/app/Components/dashboard/HospitalSelector";
import { PatientContextMenu } from "@/app/Components/dashboard/PatientContextMenu";
import { ConfirmationDialog } from "@/app/Components/dashboard/ConfirmationDialog";
import { SuccessToast } from "@/app/Components/dashboard/SuccessToast";
import { DataTooltip } from "@/app/Components/dashboard/DataTooltip";
import { AlertBanner } from "@/app/Components/dashboard/AlertBanner";
import { LoadingDialog } from "@/app/Components/dashboard/LoadingDialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// Mock data
const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "critical",
        title: "Critical Surge at St. Mary's",
        description: "Capacity reached 98% in ER",
        timestamp: "5 mins ago",
        read: false,
    },
    {
        id: "2",
        type: "warning",
        title: "New Redirection Request",
        description: "Transfer of #9221 from North Sector",
        timestamp: "25 mins ago",
        read: false,
    },
    {
        id: "3",
        type: "info",
        title: "Shift Summary Available",
        description: "Night shift report ready for review",
        timestamp: "1 hour ago",
        read: true,
    },
];

const mockHospitals: Hospital[] = [
    {
        id: "1",
        name: "City General Hospital",
        location: "Downtown",
        status: "normal",
    },
    {
        id: "2",
        name: "St. Mary's Medical Center",
        location: "North District",
        status: "critical",
    },
    {
        id: "3",
        name: "Regional Trauma Center",
        location: "West Side",
        status: "busy",
    },
    {
        id: "4",
        name: "Community Health Clinic",
        location: "East End",
        status: "normal",
    },
    {
        id: "5",
        name: "University Medical Center",
        location: "Campus",
        status: "normal",
    },
];

export default function ComponentShowcasePage() {
    const [notifications, setNotifications] =
        useState<Notification[]>(mockNotifications);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
        mockHospitals[0],
    );
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [loadingDialogOpen, setLoadingDialogOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showAlertBanner, setShowAlertBanner] = useState(true);

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
    };

    const handleConfirmAction = () => {
        setConfirmDialogOpen(false);
        setLoadingDialogOpen(true);

        // Simulate async operation
        setTimeout(() => {
            setLoadingDialogOpen(false);
            setShowSuccessToast(true);
            toast.success("Policy updated successfully!");

            // Auto-hide toast after 5 seconds
            setTimeout(() => setShowSuccessToast(false), 5000);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-bg-main p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-text-primary">
                            Interactive Components Showcase
                        </h1>
                        <p className="text-neutral-text-secondary mt-2">
                            All dialog boxes, menus, and notifications for the Vitality
                            dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationPopover
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onViewAll={() => console.log("View all")}
                        />
                    </div>
                </div>

                {/* Alert Banner */}
                {showAlertBanner && (
                    <AlertBanner
                        variant="warning"
                        title="System Maintenance Scheduled"
                        description="The system will undergo maintenance on Feb 5th from 2:00 AM to 4:00 AM EST."
                        action={{
                            label: "Learn more",
                            onClick: () => console.log("Learn more clicked"),
                        }}
                        onDismiss={() => setShowAlertBanner(false)}
                    />
                )}

                {/* Success Toast */}
                {showSuccessToast && (
                    <div className="fixed top-4 right-4 z-50 w-96">
                        <SuccessToast
                            title="Success"
                            description="Policy updated successfully."
                            onClose={() => setShowSuccessToast(false)}
                        />
                    </div>
                )}

                {/* Component Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hospital Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hospital Selector</CardTitle>
                            <CardDescription>
                                Searchable dropdown with status indicators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HospitalSelector
                                hospitals={mockHospitals}
                                selectedHospital={selectedHospital}
                                onSelectHospital={setSelectedHospital}
                            />
                        </CardContent>
                    </Card>

                    {/* Patient Context Menu */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Context Menu</CardTitle>
                            <CardDescription>
                                Quick actions for patient management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PatientContextMenu
                                patientName="John Doe"
                                patientInitials="JD"
                                patientRole="Trauma"
                                actions={[
                                    {
                                        type: "fast-track",
                                        label: "Fast-track",
                                        icon: <span>⚡</span>,
                                        onAction: () => toast.info("Fast-track initiated"),
                                    },
                                    {
                                        type: "redirect",
                                        label: "Redirect",
                                        icon: <span>🧭</span>,
                                        onAction: () => toast.info("Redirect initiated"),
                                    },
                                    {
                                        type: "audit-log",
                                        label: "View Audit Log",
                                        icon: <span>📋</span>,
                                        onAction: () => toast.info("Opening audit log"),
                                    },
                                    {
                                        type: "discharge",
                                        label: "Discharge",
                                        icon: <span>❌</span>,
                                        variant: "destructive",
                                        onAction: () => toast.error("Discharge initiated"),
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>

                    {/* Confirmation Dialog */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirmation Dialog</CardTitle>
                            <CardDescription>
                                Warning dialogs for critical actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setConfirmDialogOpen(true)}>
                                Open Confirmation Dialog
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Data Tooltip */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Tooltip</CardTitle>
                            <CardDescription>Interactive chart data display</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <DataTooltip
                                value="94%"
                                label="Thursday"
                                percentage={12}
                                color="#3b82f6"
                            >
                                <div className="h-32 w-16 bg-brand-primary rounded-t-lg cursor-pointer hover:opacity-80 transition-opacity flex items-end justify-center pb-2">
                                    <span className="text-white text-xs font-bold">94%</span>
                                </div>
                            </DataTooltip>
                        </CardContent>
                    </Card>

                    {/* Alert Variants */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Alert Banners</CardTitle>
                            <CardDescription>
                                Different alert types for various scenarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AlertBanner
                                variant="info"
                                title="New Feature Available"
                                description="Check out the new simulation dashboard for predictive analytics."
                            />
                            <AlertBanner
                                variant="success"
                                title="Transfer Completed"
                                description="Patient #4521 successfully transferred to Regional Trauma Center."
                            />
                            <AlertBanner
                                variant="error"
                                title="Connection Error"
                                description="Unable to sync with external hospital system. Retrying..."
                            />
                        </CardContent>
                    </Card>

                    {/* Toast Variants */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Toast Notifications</CardTitle>
                            <CardDescription>
                                Temporary notifications for user feedback
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button
                                onClick={() =>
                                    toast.success("Operation completed successfully")
                                }
                                variant="outline"
                            >
                                Success Toast
                            </Button>
                            <Button
                                onClick={() => toast.info("New information available")}
                                variant="outline"
                            >
                                Info Toast
                            </Button>
                            <Button
                                onClick={() => toast.warning("Please review this action")}
                                variant="outline"
                            >
                                Warning Toast
                            </Button>
                            <Button
                                onClick={() => toast.error("An error occurred")}
                                variant="outline"
                            >
                                Error Toast
                            </Button>
                            <Button
                                onClick={() => setLoadingDialogOpen(true)}
                                variant="outline"
                            >
                                Loading Dialog
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialogs */}
                <ConfirmationDialog
                    open={confirmDialogOpen}
                    onOpenChange={setConfirmDialogOpen}
                    title="Confirm Policy Change"
                    description="Are you sure you want to apply routing to the North Sector? This will immediately affect and trigger notifications to all regional directors."
                    highlightedText="Code Red"
                    impactText="This will immediately affect 4 active transfers and trigger notifications to all regional directors."
                    confirmLabel="Apply Changes"
                    cancelLabel="Cancel"
                    onConfirm={handleConfirmAction}
                    variant="warning"
                />

                <LoadingDialog
                    open={loadingDialogOpen}
                    title="Applying Changes"
                    description="Please wait while we update the policy configuration..."
                />
            </div>
        </div>
    );
}
