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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);
const yaxis = [100, 75, 50, 25, 0];

const xaxis = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
];

const PatientFlowChart = () => {
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
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 text-right pr-2 w-8 h-full">
                    {yaxis.map((item, index) => (
                        <span key={index}>{item}</span>
                    ))}
                </div>
                <div className="ml-10 h-full flex items-end justify-between relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yaxis.map((item, index) => (
                            <div
                                key={index}
                                className="border-t border-gray-100 dark:border-gray-800 w-full h-0"
                            ></div>
                        ))}
                    </div>
                    <Chart
                        type="line"
                        data={{
                            labels: xaxis,
                            datasets: [
                                {
                                    label: "Incoming",
                                    data: [100, 75, 50, 25, 0],
                                    borderColor: "#3b82f6",
                                    borderWidth: 3,
                                },
                                {
                                    label: "Treatment",
                                    data: [100, 75, 50, 25, 0],
                                    borderColor: "#10b981",
                                    borderWidth: 3,
                                    borderDash: [5, 5],
                                },
                            ],
                        }}
                    />
                    <div className="absolute left-2/3 top-1/4 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg">
                        Incoming: 82
                    </div>
                    <div className="absolute left-2/3 top-1/4 h-32 w-px bg-gray-300 dark:bg-gray-600 border-dashed border-l pointer-events-none mt-6"></div>
                </div>
                <div className="ml-10 mt-2 flex justify-between text-xs text-gray-400">
                    <span>10:00 AM</span>
                    <span>11:00 AM</span>
                    <span>12:00 PM</span>
                    <span>01:00 PM</span>
                    <span>02:00 PM</span>
                    <span>03:00 PM</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-15">
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
