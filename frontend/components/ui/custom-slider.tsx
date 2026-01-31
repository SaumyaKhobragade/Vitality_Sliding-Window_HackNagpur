"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}

export function CustomSlider({
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    className,
}: SliderProps) {
    const percentage = Math.min(
        Math.max(((value - min) / (max - min)) * 100, 0),
        100,
    );

    return (
        <div
            className={cn(
                "relative flex w-full touch-none select-none items-center py-4",
                className,
            )}
        >
            {/* Track */}
            <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-border dark:bg-white/20">
                <div
                    className="absolute h-full bg-brand-primary transition-all duration-150 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Input Overlay for Interaction */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            />

            {/* Thumb (Visual Only) */}
            <div
                className="absolute h-5 w-5 rounded-full border-2 border-brand-primary bg-white shadow-md ring-offset-background transition-transform duration-100 ease-out hover:scale-110 pointer-events-none z-10"
                style={{ left: `calc(${percentage}% - 10px)` }}
            />
        </div>
    );
}
