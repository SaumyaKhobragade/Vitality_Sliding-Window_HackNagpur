import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "../Components/Common/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
