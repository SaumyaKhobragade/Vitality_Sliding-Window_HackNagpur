"use client";

import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: "default" | "warning" | "destructive";
    highlightedText?: string;
    impactText?: string;
    loading?: boolean;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "default",
    highlightedText,
    impactText,
    loading = false,
}: ConfirmationDialogProps) {
    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    const handleConfirm = () => {
        onConfirm();
        if (!loading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        {variant !== "default" && (
                            <div
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                    variant === "warning" && "bg-alert-bg-amber",
                                    variant === "destructive" && "bg-alert-bg-red",
                                )}
                            >
                                <AlertTriangle
                                    className={cn(
                                        "h-5 w-5",
                                        variant === "warning" && "text-severity-urgent",
                                        variant === "destructive" && "text-severity-critical",
                                    )}
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <DialogTitle className="text-left text-lg font-semibold">
                                {title}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <DialogDescription className="text-left text-neutral-text-secondary pt-2">
                    {typeof description === "string" ? (
                        <p>
                            {description
                                .split(highlightedText || "")
                                .map((part, index, array) => (
                                    <span key={index}>
                                        {part}
                                        {index < array.length - 1 && highlightedText && (
                                            <span className="font-semibold text-severity-critical bg-alert-bg-red px-1 rounded">
                                                {highlightedText}
                                            </span>
                                        )}
                                    </span>
                                ))}
                        </p>
                    ) : (
                        description
                    )}

                    {impactText && (
                        <p className="mt-3 font-medium text-neutral-text-primary">
                            {impactText}
                        </p>
                    )}
                </DialogDescription>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                        className="hover:bg-accent"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            variant === "default" &&
                            "bg-brand-primary hover:bg-brand-primary/90",
                            variant === "warning" &&
                            "bg-severity-urgent hover:bg-severity-urgent/90",
                            variant === "destructive" &&
                            "bg-severity-critical hover:bg-severity-critical/90",
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing...
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
