"use client";

import { Zap, Navigation, FileText, UserX } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface PatientContextAction {
    type: "fast-track" | "redirect" | "audit-log" | "discharge";
    label: string;
    icon: React.ReactNode;
    variant?: "default" | "destructive";
    onAction: () => void;
}

interface PatientContextMenuProps {
    patientName: string;
    patientInitials: string;
    patientRole?: string;
    actions?: PatientContextAction[];
    className?: string;
}

const defaultActions: PatientContextAction[] = [
    {
        type: "fast-track",
        label: "Fast-track",
        icon: <Zap className="h-4 w-4" />,
        onAction: () => console.log("Fast-track"),
    },
    {
        type: "redirect",
        label: "Redirect",
        icon: <Navigation className="h-4 w-4" />,
        onAction: () => console.log("Redirect"),
    },
    {
        type: "audit-log",
        label: "View Audit Log",
        icon: <FileText className="h-4 w-4" />,
        onAction: () => console.log("View Audit Log"),
    },
    {
        type: "discharge",
        label: "Discharge",
        icon: <UserX className="h-4 w-4" />,
        variant: "destructive",
        onAction: () => console.log("Discharge"),
    },
];

export function PatientContextMenu({
    patientName,
    patientInitials,
    patientRole,
    actions = defaultActions,
    className,
}: PatientContextMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 h-auto hover:bg-accent transition-colors",
                        className,
                    )}
                >
                    <Avatar className="h-8 w-8 bg-brand-primary text-white">
                        <AvatarFallback className="bg-brand-primary text-white font-medium">
                            {patientInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{patientName}</span>
                        {patientRole && (
                            <span className="text-xs text-neutral-text-muted">
                                {patientRole}
                            </span>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 shadow-lg border-neutral-border"
            >
                {actions.map((action, index) => {
                    const isLastDestructive =
                        action.variant === "destructive" && index === actions.length - 1;
                    const hasSeparatorBefore = isLastDestructive && index > 0;

                    return (
                        <div key={action.type}>
                            {hasSeparatorBefore && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={action.onAction}
                                className={cn(
                                    "flex items-center gap-2 cursor-pointer transition-colors",
                                    action.variant === "destructive" &&
                                    "text-severity-critical focus:text-severity-critical focus:bg-alert-bg-red",
                                )}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </DropdownMenuItem>
                        </div>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
