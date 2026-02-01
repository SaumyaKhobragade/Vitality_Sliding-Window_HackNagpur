"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import {
    Users,
    TrendingUp,
    Activity,
    TriangleAlert,
    Shuffle,
    ArrowDown,
} from "lucide-react";
import { useSimulation } from "@/app/Components/Context/SimulationContext";

const DashboardStats = () => {
    const { stats, hospitals, simStats, isRunning } = useSimulation();

    // Use simStats when simulation is running, otherwise use backend stats
    const currentStats = isRunning && simStats ? simStats : stats;

    // Calculate overloaded hospitals
    const overloadedCount = Object.values(hospitals).filter(h => {
        if (!h.maxCapacity) return false;
        return (h.totalQueueSize / h.maxCapacity) >= 0.7; // 70% threshold
    }).length;

    const data = [
        {
            title: "Patients Waiting",
            value: currentStats?.totalPatientsWaiting?.toString() || "0",
            icon: <Users className="h-6 w-6" />,
            color: "bg-blue-50 dark:bg-blue-900/30",
            trend: "12%",
            trendIcon: <TrendingUp className="h-4 w-4 mr-1" />,
            trendColor: "text-green-500",
            trendText: "vs last hour",
        },
        {
            title: "Active Doctors",
            value: currentStats?.totalDoctorsActive?.toString() || "0",
            icon: <Activity className="h-6 w-6" />,
            color: "bg-green-50 dark:bg-green-900/30",
            trend: "Stable",
            trendIcon: <ArrowDown className="h-4 w-4 mr-1" />,
            trendColor: "text-gray-500",
            trendText: "flow rate",
        },
        {
            title: "Overloaded",
            value: overloadedCount.toString(),
            icon: <TriangleAlert className="h-6 w-6" />,
            color: "bg-red-50 dark:bg-red-900/30",
            trend: "Critical",
            trendIcon: <ArrowDown className="h-4 w-4 mr-1" />,
            trendColor: "text-red-500",
            trendText: "Action required",
        },
        {
            title: "Redirections (15m)",
            value: currentStats?.recentRedirections?.toString() || "0",
            icon: <Shuffle className="h-6 w-6" />,
            color: "bg-purple-50 dark:bg-purple-900/30",
            trend: "-",
            trendIcon: <ArrowDown className="h-4 w-4 mr-1" />,
            trendColor: "text-green-500",
            trendText: "vs prev 15m",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {data.map((item, index) => (
                <Card key={index} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {item.title}
                            </p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {item.value}
                            </h3>
                        </div>
                        <span className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
                            {item.icon}
                        </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="flex items-center text-green-500 font-medium">
                            {item.trendIcon}
                            {item.trend}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 ml-2">
                            {item.trendText}
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;