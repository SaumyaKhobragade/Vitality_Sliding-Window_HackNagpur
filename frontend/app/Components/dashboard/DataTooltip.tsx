"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface DataTooltipProps {
    children: React.ReactNode;
    value: string | number;
    label?: string;
    percentage?: number;
    color?: string;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

export function DataTooltip({
    children,
    value,
    label,
    percentage,
    color = "#3b82f6",
    side = "top",
    className,
}: DataTooltipProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    className={cn(
                        "bg-neutral-text-primary text-white border-none shadow-xl px-3 py-2 rounded-lg",
                        className,
                    )}
                    sideOffset={8}
                >
                    <div className="flex flex-col gap-1">
                        {label && (
                            <div className="text-xs text-white/70 font-medium">{label}</div>
                        )}
                        <div className="flex items-center gap-2">
                            {color && (
                                <div
                                    className="h-3 w-3 rounded-sm shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                            )}
                            <div className="font-bold text-base">{value}</div>
                        </div>
                        {percentage !== undefined && (
                            <div className="text-xs text-white/70">
                                {percentage > 0 ? "+" : ""}
                                {percentage}%
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
