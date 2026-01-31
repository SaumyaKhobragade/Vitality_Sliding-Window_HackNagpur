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
import { useSimulation } from "@/app/Components/Context/SimulationContext";
import { useEffect, useState } from "react";

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
            display: false,
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

export function LiveImpactAnalysis() {
    const { stats } = useSimulation();
    const [history, setHistory] = useState<number[]>([]);

    useEffect(() => {
        if (stats) {
            setHistory(prev => {
                const newHistory = [...prev, stats.totalPatientsWaiting];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        }
    }, [stats]);

    const chartData = {
        labels: history.map((_, i) => i),
        datasets: [
            {
                label: 'Queue Length',
                data: history,
                borderColor: '#94A3B8',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-primary" />
                    <CardTitle className="text-lg font-semibold text-neutral-text-primary">
                        Live Impact Analysis
                    </CardTitle>
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
                            --
                            <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                                m
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Queue Total
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            {stats?.totalPatientsWaiting || 0}
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Processed
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            --
                            <span className="text-sm font-normal text-neutral-text-secondary ml-0.5">
                                /min
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="text-xs text-neutral-text-muted font-medium mb-1">
                            Crit. Failures
                        </div>
                        <div className="text-2xl font-bold text-neutral-text-primary">
                            0
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