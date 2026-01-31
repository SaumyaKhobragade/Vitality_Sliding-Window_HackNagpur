"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface LiveImpactAnalysisProps {
    chartData: ChartData<"line">;
}

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top" as const,
            align: "end" as const,
            labels: {
                usePointStyle: true,
                boxWidth: 8,
                padding: 20,
                font: {
                    family: "Inter",
                    size: 12,
                },
            },
        },
        tooltip: {
            mode: "index" as const,
            intersect: false,
            backgroundColor: "rgba(17, 24, 39, 0.9)",
            titleColor: "#fff",
            bodyColor: "#CBD5E1",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 10,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: "#94A3B8",
                font: { family: "Inter", size: 10 },
            },
        },
        y: {
            grid: {
                color: "#E2E8F0",
                borderDash: [4, 4],
            },
            ticks: {
                color: "#94A3B8",
                font: { family: "Inter", size: 10 },
            },
        },
    },
    interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
    },
};

export function LiveImpactAnalysis({ chartData }: LiveImpactAnalysisProps) {
    return (
        <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-primary" />
                    <CardTitle className="text-lg font-semibold text-neutral-text-primary">
                        Live Impact Analysis
                    </CardTitle>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-text-secondary">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></span>
                        Wait Times
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] opacity-50"></span>
                        Queue Length
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Avg Wait
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            42
                            <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                                m
                            </span>
                        </div>
                        <div className="text-xs font-semibold text-red-500 mt-1 flex items-center">
                            <Activity className="w-3 h-3 mr-1" /> +12%
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Queue Total
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            1,204
                        </div>
                        <div className="text-xs font-semibold text-red-500 mt-1 flex items-center">
                            <Activity className="w-3 h-3 mr-1" /> +8%
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Processed
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            89
                            <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                                /min
                            </span>
                        </div>
                        <div className="text-xs font-semibold text-green-500 mt-1 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Stable
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Crit. Failures
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            0
                        </div>
                        <div className="text-xs font-medium text-neutral-text-muted mt-1">
                            Last 5 min
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 min-h-[300px] w-full relative">
                    <Line options={CHART_OPTIONS} data={chartData} />
                </div>
            </CardContent>
        </Card>
    );
}
