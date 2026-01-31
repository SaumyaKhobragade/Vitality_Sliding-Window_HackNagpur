"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { getPatientFlowData } from "@/lib/data";
import { PatientFlowRecord } from "@/lib/types";

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
    const [data, setData] = useState<PatientFlowRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getPatientFlowData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch patient flow data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = {
        labels: data.map(d => d.timestamp),
        datasets: [
            {
                label: "Incoming",
                data: data.map(d => d.newArrivals),
                borderColor: "#3b82f6",
                borderWidth: 3,
            },
            {
                label: "Treatment",
                data: data.map(d => d.discharged),
                borderColor: "#10b981",
                borderWidth: 3,
                borderDash: [5, 5],
            },
        ],
    };

    const latestIncoming = data.length > 0 ? data[data.length - 1].newArrivals : 0;

    return (
        <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Patient Flow Analysis
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Incoming vs Treatment Rate (Real-time)
                    </p>
                </div>
                <div className="flex items-center gap-2">
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
                    {data.length > 0 && (
                        <div className="absolute left-2/3 top-1/4 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg z-10">
                            Incoming: {latestIncoming}
                        </div>
                    )}
                </div>
                
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Incoming Rate
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Treatment Rate
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PatientFlowChart;
