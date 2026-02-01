import {
    Users,
    UserMinus,
    AlertTriangle,
    Filter,
    Zap,
    RotateCcw,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomSlider } from "@/components/ui/custom-slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISTRESS_FREQUENCIES, POLICY_OPTIONS } from "@/lib/constants";

interface ChaosControlsProps {
    patientSurge: number;
    setPatientSurge: (val: number) => void;
    staffDropout: number;
    setStaffDropout: (val: number) => void;
    distressFreq: "LOW" | "MED" | "HIGH";
    setDistressFreq: (val: "LOW" | "MED" | "HIGH") => void;
    policyLogic: string;
    setPolicyLogic: (val: string) => void;
    onTriggerSurge?: () => void;
    onTriggerStaffDropout?: () => void;
}

export function ChaosControls({
    patientSurge,
    setPatientSurge,
    staffDropout,
    setStaffDropout,
    distressFreq,
    setDistressFreq,
    policyLogic,
    setPolicyLogic,
    onTriggerSurge,
    onTriggerStaffDropout,
}: ChaosControlsProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-neutral-text-primary">
                <Filter className="w-5 h-5 text-brand-primary" />
                <h2>Chaos Controls</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Patient Surge */}
                <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-text-secondary">
                                Patient Surge
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Multiplier 1x - 10x
                            </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end justify-between mb-4">
                            <div className="text-3xl font-bold tabular-nums">
                                {patientSurge.toFixed(1)}
                                <span className="text-lg text-neutral-text-muted font-normal ml-0.5">
                                    x
                                </span>
                            </div>
                            {patientSurge > 5 && (
                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none text-[10px] uppercase font-bold px-2 py-0.5 mb-1.5">
                                    High Load
                                </Badge>
                            )}
                        </div>
                        <CustomSlider
                            value={patientSurge}
                            min={1}
                            max={10}
                            step={0.1}
                            onChange={setPatientSurge}
                            className="py-2"
                        />
                        <Button
                            variant="ghost"
                            onClick={onTriggerSurge}
                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 h-9 text-xs font-semibold uppercase tracking-wide mt-2 cursor-pointer"
                        >
                            <Zap className="w-3 h-3 mr-1.5" /> Trigger Surge
                        </Button>
                    </CardContent>
                </Card>

                {/* Card 2: Staff Dropout */}
                <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-text-secondary">
                                Staff Dropout
                            </CardTitle>
                            <CardDescription className="text-xs">Reduction %</CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                            <UserMinus className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-4">
                            <div className="text-3xl font-bold tabular-nums">
                                {staffDropout}
                                <span className="text-lg text-neutral-text-muted font-normal ml-0.5">
                                    %
                                </span>
                            </div>
                        </div>
                        {/* Custom Red Slider track style would be ideal, standard for now */}
                        <div className="relative flex w-full touch-none select-none items-center py-2">
                            <CustomSlider
                                value={staffDropout}
                                min={0}
                                max={100}
                                step={1}
                                onChange={setStaffDropout}
                                className="[&>div>div]:bg-red-500 [&>div:last-child]:border-red-500" // Override colors
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onClick={onTriggerStaffDropout}
                            className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 h-9 text-xs font-semibold uppercase tracking-wide mt-2 cursor-pointer"
                        >
                            <UserMinus className="w-3 h-3 mr-1.5" /> Apply Dropout
                        </Button>
                    </CardContent>
                </Card>

                {/* Card 3: Distress Freq */}
                <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-text-secondary">
                                Distress Freq.
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Event Injection Rate
                            </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-end pt-8">
                        <div className="bg-neutral-100 p-1 rounded-lg flex items-center gap-1">
                            {DISTRESS_FREQUENCIES.map((level) => (
                                <button
                                    key={level}
                                    onClick={() =>
                                        setDistressFreq(level as "LOW" | "MED" | "HIGH")
                                    }
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer",
                                        distressFreq === level
                                            ? level === "LOW"
                                                ? "bg-white text-neutral-800 shadow-sm"
                                                : level === "MED"
                                                    ? "bg-amber-500 text-white shadow-sm"
                                                    : "bg-red-500 text-white shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50",
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 4: Policy Logic */}
                <Card className="border-none shadow-sm ring-1 ring-neutral-200/60 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-text-secondary">
                                Policy Logic
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Live Override
                            </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                            <Zap className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        <Select value={policyLogic} onValueChange={setPolicyLogic}>
                            <SelectTrigger className="w-full bg-neutral-50 border-neutral-200">
                                <SelectValue placeholder="Select Policy" />
                            </SelectTrigger>
                            <SelectContent>
                                {POLICY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 h-9 text-xs font-semibold uppercase tracking-wide cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3 mr-1.5" /> Apply Instantly
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
