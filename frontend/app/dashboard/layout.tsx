"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "../Components/Common/Sidebar";
import { useAuth } from "../Context/AuthContext";
import { AuthPromptOverlay } from "../Components/auth/AuthPromptOverlay";
import { DashboardNavBar } from "../Components/Navigation/DashboardNavBar";
import { RealtimeProvider } from "../Components/Context/RealtimeContext";
import { SimulationProvider } from "../Components/Context/SimulationContext";
import { SimulationStatusBadge } from "../Components/Common/SimulationStatusBadge";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <RealtimeProvider>
                    <SimulationProvider>
                        <DashboardNavBar />
                        {children}
                        <SimulationStatusBadge />
                    </SimulationProvider>
                </RealtimeProvider>
                {!user && <AuthPromptOverlay />}
            </SidebarInset>
        </SidebarProvider>
    );
}
