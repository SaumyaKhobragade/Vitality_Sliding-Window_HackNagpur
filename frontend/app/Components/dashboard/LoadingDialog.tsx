"use client";

import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface LoadingDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    className?: string;
}

export function LoadingDialog({
    open,
    title = "Processing",
    description = "Please wait while we process your request...",
    className,
}: LoadingDialogProps) {
    return (
        <Dialog open={open}>
            <DialogContent className={cn("sm:max-w-100", className)} showCloseButton={false}>
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
                            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-brand-primary/20" />
                        </div>
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-lg font-semibold">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-neutral-text-secondary">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
