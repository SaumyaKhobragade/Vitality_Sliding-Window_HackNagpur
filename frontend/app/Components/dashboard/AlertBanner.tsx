"use client";

import { AlertTriangle, Info, CheckCircle2, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AlertBannerProps {
    variant: "info" | "warning" | "success" | "error";
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    onDismiss?: () => void;
    className?: string;
}

const variantConfig = {
    info: {
        icon: Info,
        bg: "bg-alert-bg-sky border-system-info",
        iconColor: "text-system-info",
        textColor: "text-blue-900 dark:text-blue-100",
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-alert-bg-amber border-severity-urgent",
        iconColor: "text-severity-urgent",
        textColor: "text-amber-900 dark:text-amber-100",
    },
    success: {
        icon: CheckCircle2,
        bg: "bg-green-50 dark:bg-green-950/20 border-system-success",
        iconColor: "text-system-success",
        textColor: "text-green-900 dark:text-green-100",
    },
    error: {
        icon: XCircle,
        bg: "bg-alert-bg-red border-severity-critical",
        iconColor: "text-severity-critical",
        textColor: "text-red-900 dark:text-red-100",
    },
};

export function AlertBanner({
    variant,
    title,
    description,
    action,
    onDismiss,
    className,
}: AlertBannerProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-l-4",
                config.bg,
                className,
            )}
            role="alert"
        >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
            <div className="flex-1 min-w-0">
                <h4 className={cn("font-semibold text-sm mb-1", config.textColor)}>
                    {title}
                </h4>
                {description && (
                    <p className={cn("text-sm opacity-90", config.textColor)}>
                        {description}
                    </p>
                )}
                {action && (
                    <Button
                        variant="link"
                        onClick={action.onClick}
                        className={cn("h-auto p-0 mt-2 font-semibold", config.iconColor)}
                    >
                        {action.label} →
                    </Button>
                )}
            </div>
            {onDismiss && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDismiss}
                    className={cn(
                        "h-6 w-6 shrink-0 hover:bg-black/5 dark:hover:bg-white/5",
                        config.textColor,
                    )}
                    aria-label="Dismiss alert"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
