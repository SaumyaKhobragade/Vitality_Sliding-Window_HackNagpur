"use client";

import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SuccessToastProps {
    title: string;
    description?: string;
    onClose?: () => void;
    className?: string;
    variant?: "success" | "info" | "warning" | "error";
}

export function SuccessToast({
    title,
    description,
    onClose,
    className,
    variant = "success",
}: SuccessToastProps) {
    const variantStyles = {
        success: {
            bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
            icon: "text-system-success",
            text: "text-green-900 dark:text-green-100",
        },
        info: {
            bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
            icon: "text-system-info",
            text: "text-blue-900 dark:text-blue-100",
        },
        warning: {
            bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
            icon: "text-severity-urgent",
            text: "text-amber-900 dark:text-amber-100",
        },
        error: {
            bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
            icon: "text-severity-critical",
            text: "text-red-900 dark:text-red-100",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-5 fade-in duration-300",
                styles.bg,
                className,
            )}
            role="alert"
            aria-live="polite"
        >
            <CheckCircle2
                className={cn("h-5 w-5 shrink-0 mt-0.5", styles.icon)}
            />
            <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-sm", styles.text)}>{title}</p>
                {description && (
                    <p className={cn("text-sm mt-1 opacity-90", styles.text)}>
                        {description}
                    </p>
                )}
            </div>
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className={cn(
                        "h-6 w-6 shrink-0 hover:bg-black/5 dark:hover:bg-white/5",
                        styles.text,
                    )}
                    aria-label="Close notification"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
