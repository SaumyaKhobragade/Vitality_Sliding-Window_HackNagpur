"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Plus, ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchBar } from "@/app/Components/Common/SearchBar";
import { useSimulation } from "@/app/Components/Context/SimulationContext";
import { useAuth } from "@/app/Context/AuthContext";
import {
    NotificationPopover,
    type Notification,
} from "@/app/Components/dashboard/NotificationPopover";
import {
    HospitalSelector,
    type Hospital,
} from "@/app/Components/dashboard/HospitalSelector";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DashboardNavBar = () => {
    const { toggleSidebar } = useSidebar();
    const { isConnected } = useSimulation();
    const { user, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);

    // Prevent SSR rendering to avoid hydration mismatch with Radix UI IDs
    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock notifications data
    const [notifications, setNotifications] = useState<Notification[]>([
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
    ]);

    // Mock hospitals data
    const hospitals: Hospital[] = [
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
    ];

    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
        hospitals[0],
    );

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
    };

    return (
        <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 transition-colors duration-200">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="mr-2 md:hidden text-gray-500 hover:text-gray-700"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="w-64">
                    <HospitalSelector
                        hospitals={hospitals}
                        selectedHospital={selectedHospital}
                        onSelectHospital={setSelectedHospital}
                    />
                </div>
            </div>
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                <SearchBar
                    placeholder="Search hospitals, IDs, or alerts..."
                    variant="rounded"
                    size="md"
                />
            </div>
            <div className="flex items-center gap-4">
                <NotificationPopover
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onViewAll={() => console.log("View all notifications")}
                />
                <Button
                    size="icon"
                    className="rounded-full bg-primary text-white hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                </Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${isConnected
                                ? "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800"
                            }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? "bg-green-500" : "bg-red-500"
                                }`}
                        ></div>
                        <span
                            className={`text-xs font-semibold ${isConnected
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-700 dark:text-red-400"
                                }`}
                        >
                            {isConnected ? "Connected" : "Disconnected"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                    {mounted ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                                            {user?.name || "Guest User"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {user ? "Authenticated" : "Guest"}
                                        </p>
                                    </div>
                                    <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                        <AvatarImage
                                            src={user?.avatarUrl || ""}
                                            alt={user?.name || "User"}
                                        />
                                        <AvatarFallback>
                                            {user?.name?.substring(0, 2).toUpperCase() || "GU"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                                    {user?.name || "Guest User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {user ? "Authenticated" : "Guest"}
                                </p>
                            </div>
                            <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                <AvatarImage
                                    src={user?.avatarUrl || ""}
                                    alt={user?.name || "User"}
                                />
                                <AvatarFallback>
                                    {user?.name?.substring(0, 2).toUpperCase() || "GU"}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
