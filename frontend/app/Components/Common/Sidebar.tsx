"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    LayoutDashboard,
    Building,
    MapPin,
    Signpost,
    BellRing,
    FileText,
    CircleHelp,
    Users,
    Play,
    UserPlus,
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
import { useAuth } from "@/app/Context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as ApiClient from "@/lib/api-client";

const CCTV_VIDEO_CLIP_COUNT = 6; // Number of CCTV video clips for distress monitoring

const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const [alertCount, setAlertCount] = useState(CCTV_VIDEO_CLIP_COUNT); // Start with CCTV count

    // Fetch database alert count
    useEffect(() => {
        const fetchAlertCount = async () => {
            try {
                const events = await ApiClient.getDistressEvents();
                const activeAlerts = events.filter((e: any) => e.status === 'active');
                setAlertCount(CCTV_VIDEO_CLIP_COUNT + activeAlerts.length);
            } catch (error) {
                // Keep default count on error
                console.warn('Could not fetch alert count');
            }
        };

        fetchAlertCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchAlertCount, 30000);
        return () => clearInterval(interval);
    }, []);

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
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === "/dashboard"}
                                    tooltip="City Dashboard"
                                >
                                    <Link href="/dashboard">
                                        <LayoutDashboard />
                                        <span>City Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* <SidebarGroup>
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
                </SidebarGroup> */}

                <SidebarGroup>
                    <SidebarGroupLabel>Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/add-patient")}
                                    tooltip="Add Patient"
                                >
                                    <Link href="/dashboard/add-patient">
                                        <UserPlus />
                                        <span>Add Patient</span>
                                        <span className="ml-auto bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 py-0.5 px-2 rounded-full text-xs font-bold group-data-[collapsible=icon]:hidden">
                                            New
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/decision-monitor")}
                                    tooltip="Redirections"
                                >
                                    <Link href="/dashboard/decision-monitor">
                                        <Signpost />
                                        <span>Redirections</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/alerts")}
                                    tooltip="Distress Alerts"
                                >
                                    <Link href="/dashboard/alerts">
                                        <BellRing />
                                        <span>Distress Alerts</span>
                                        <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 py-0.5 px-2 rounded-full text-xs font-bold group-data-[collapsible=icon]:hidden">
                                            {alertCount}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/queue-details")}
                                    tooltip="Queue Details"
                                >
                                    <Link href="/dashboard/queue-details">
                                        <Users />
                                        <span>Queue Details</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/simulation")}
                                    tooltip="Simulation"
                                >
                                    <Link href="/dashboard/simulation">
                                        <Play />
                                        <span>Simulation</span>
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
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith("/dashboard/policy-config")}
                                    tooltip="Policies"
                                >
                                    <Link href="/dashboard/policy-config">
                                        <FileText />
                                        <span>Policies</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {user && (
                        <SidebarMenuItem>
                            <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
                                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">{user.name}</span>
                                    <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                </div>
                            </div>
                            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-2">
                                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </ShadcnSidebar>
    );
};

export default Sidebar;
