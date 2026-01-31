import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationHeaderProps {
    isRunning: boolean;
    onRunToggle: () => void;
    onReset: () => void;
}

export function SimulationHeader({
    isRunning,
    onRunToggle,
    onReset,
}: SimulationHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        System Active
                    </Badge>
                    <span className="text-sm text-neutral-text-muted font-medium">
                        v4.2.0-rc
                    </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-text-primary">
                    Simulation & Chaos Mode
                </h1>
                <p className="text-neutral-text-secondary mt-1 max-w-2xl text-base">
                    Stress-test adaptive triage logic with real-time variables. Inject
                    chaos to validate resilience.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="bg-white hover:bg-neutral-50 border-neutral-border text-neutral-text-primary font-medium"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
                <Button
                    onClick={onRunToggle}
                    className={cn(
                        "font-medium shadow-lg shadow-blue-500/20 transition-all",
                        isRunning
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-brand-primary hover:bg-blue-600 text-white",
                    )}
                >
                    {isRunning ? (
                        <>
                            <Zap className="w-4 h-4 mr-2 fill-current" /> Pause Simulation
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2 fill-current" /> Run Simulation
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
