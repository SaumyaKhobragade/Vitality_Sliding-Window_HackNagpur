"use client";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/app/Components/Context/SimulationContext";
import * as ApiClient from "@/lib/api-client";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

const PatientFlowChart = () => {
    const [history, setHistory] = useState<{ time: string, waiting: number, active: number }[]>([]);
    const { stats, refreshStats, simStats, isRunning } = useSimulation();
    const [refreshing, setRefreshing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(0);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Initial fetch from API only if no simulation is running
        if (!isRunning && !simStats) {
            ApiClient.getAnalytics().then(data => {
                const mapped = data.map(r => ({
                    time: r.timestamp,
                    waiting: r.waiting,
                    active: r.activePatients
                }));
                setHistory(mapped);
            }).catch(err => console.error("Failed to load analytics history", err));
        }
    }, []);

    useEffect(() => {
        // Use simStats when simulation is running, otherwise use stats (from backend)
        const currentStats = isRunning && simStats ? simStats : (!isRunning ? stats : null);
        if (!currentStats) return;

        const now = Date.now();
        // Update at most once per second to avoid overwhelming the chart
        if (now - lastUpdate < 1000) return;
        setLastUpdate(now);

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setHistory(prev => {
            const newPoint = { 
                time: timeStr, 
                waiting: currentStats.totalPatientsWaiting || 0, 
                active: currentStats.totalDoctorsActive || 0
            };
            const newHistory = [...prev, newPoint];
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });
    }, [stats, simStats, lastUpdate, isRunning]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshStats();
        setRefreshing(false);
    };

    const chartData = {
        labels: history.map(d => d.time),
        datasets: [
            {
                label: "Patients Waiting",
                data: history.map(d => d.waiting),
                borderColor: "#3b82f6",
                borderWidth: 3,
            },
            {
                label: "Active Doctors",
                data: history.map(d => d.active),
                borderColor: "#10b981",
                borderWidth: 3,
                borderDash: [5, 5],
            },
        ],
    };

    const latestWaiting = history.length > 0 ? history[history.length - 1].waiting : 0;

    // Prevent hydration mismatch by not rendering interactive elements until mounted
    if (!mounted) {
        return (
            <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Real-Time Flow
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Patients Waiting vs Active Doctors
                        </p>
                    </div>
                </div>
                <div className="relative h-64 w-full flex items-center justify-center">
                    <div className="text-gray-400">Loading chart...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Real-Time Flow
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Patients Waiting vs Active Doctors
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleRefresh} 
                        className={cn("text-gray-400 hover:text-gray-600", refreshing && "animate-spin")}
                        aria-label="Refresh Data"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Last 1 Hour</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Select Time Range</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Last 1 Hour</DropdownMenuItem>
                                <DropdownMenuItem>Last 24 Hours</DropdownMenuItem>
                                <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="relative h-64 w-full">
                <div className="ml-0 h-full flex items-end justify-between relative">
                    <Chart
                        type="line"
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                    {history.length > 0 && (
                        <div className="absolute left-2/3 top-1/4 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg z-10">
                            Waiting: {latestWaiting}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Patients Waiting
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Active Doctors
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PatientFlowChart;