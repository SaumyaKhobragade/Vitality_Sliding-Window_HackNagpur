"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "../Components/Common/Sidebar";
import { useAuth } from "../Context/AuthContext";
import { AuthPromptOverlay } from "../Components/auth/AuthPromptOverlay";

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
                {children}
                {!user && <AuthPromptOverlay />}
            </SidebarInset>
        </SidebarProvider>
    );
}
