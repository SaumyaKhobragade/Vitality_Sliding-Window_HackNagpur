import React from "react";
import Link from "next/link";
import {
    Building2,
    LayoutDashboard,
    Building,
    MapPin,
    Signpost,
    BellRing,
    FileText,
    History,
    CircleHelp,
} from "lucide-react";
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar";

const Sidebar = () => {
    return (
        <ShadcnSidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-data-[collapsible=icon]:hidden">
                        Vitality
                    </span>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden group-data-[collapsible=icon]:block">
                        A
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="text-gray-400 h-4 w-4" />
                            <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                Environment
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Metropolis</span>
                            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                LIVE
                            </span>
                        </div>
                    </div>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive tooltip="City Dashboard">
                                    <Link href="/dashboard">
                                        <LayoutDashboard />
                                        <span>City Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Hospitals</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="All Hospitals">
                                    <Link href="#">
                                        <Building />
                                        <span>All Hospitals</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="My Hospital">
                                    <Link href="#">
                                        <MapPin />
                                        <span>My Hospital</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Redirections">
                                    <Link href="/dashboard/decision-monitor">
                                        <Signpost />
                                        <span>Redirections</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Distress Alerts">
                                    <Link href="/dashboard/alerts">
                                        <BellRing />
                                        <span>Distress Alerts</span>
                                        <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 py-0.5 px-2 rounded-full text-xs font-bold group-data-[collapsible=icon]:hidden">
                                            3
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Policies">
                                    <Link href="/dashboard/policy-config">
                                        <FileText />
                                        <span>Policies</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Audit Log">
                                    <Link href="/dashboard/audit">
                                        <History />
                                        <span>Audit Log</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Customer Support">
                            <Link href="#">
                                <CircleHelp />
                                <span>Customer Support</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </ShadcnSidebar>
    );
};

export default Sidebar;
