"use client";

import * as React from "react";
import { Bell, AlertTriangle, RefreshCw, Info } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Notification {
    id: string;
    type: "critical" | "warning" | "info";
    title: string;
    description: string;
    timestamp: string;
    read?: boolean;
}

interface NotificationPopoverProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
    onViewAll?: () => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
        case "critical":
            return <AlertTriangle className="h-4 w-4 text-severity-critical" />;
        case "warning":
            return <RefreshCw className="h-4 w-4 text-severity-urgent" />;
        case "info":
            return <Info className="h-4 w-4 text-system-info" />;
    }
};

const getNotificationBg = (type: Notification["type"]) => {
    switch (type) {
        case "critical":
            return "bg-alert-bg-red border-l-4 border-severity-critical";
        case "warning":
            return "bg-alert-bg-amber border-l-4 border-severity-urgent";
        case "info":
            return "bg-alert-bg-sky border-l-4 border-system-info";
    }
};

export function NotificationPopover({
    notifications,
    onMarkAsRead,
    onViewAll,
}: NotificationPopoverProps) {
    const unreadCount = notifications.filter((n) => !n.read).length;
    const [mounted, setMounted] = React.useState(false);

    // Prevent SSR rendering to avoid hydration mismatch with Radix UI IDs
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Render placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent transition-colors"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <Bell className="h-8 w-8" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-severity-critical animate-pulse"
                    >
                        {unreadCount}
                    </Badge>
                )}
            </Button>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-accent transition-colors"
                    aria-label={`Notifications (${unreadCount} unread)`}
                >
                    <Bell className="h-8 w-8" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-severity-critical animate-pulse"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 shadow-xl border-neutral-border"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-border">
                    <div className="flex items-center gap-2">
                        <Bell className="h-8 w-8 text-brand-primary" />
                        <h3 className="font-semibold text-neutral-text-primary">
                            Notifications
                        </h3>
                    </div>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} new
                        </Badge>
                    )}
                </div>

                <div className="max-h-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-neutral-text-muted">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-border">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => onMarkAsRead?.(notification.id)}
                                    className={cn(
                                        "w-full p-4 text-left transition-all hover:bg-neutral-surface",
                                        !notification.read && "bg-neutral-bg-main",
                                        getNotificationBg(notification.type),
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p
                                                    className={cn(
                                                        "font-medium text-sm",
                                                        notification.type === "critical"
                                                            ? "text-severity-critical"
                                                            : "text-neutral-text-primary",
                                                    )}
                                                >
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-brand-primary shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-2">
                                                {notification.description}
                                            </p>
                                            <p className="text-xs text-neutral-text-muted">
                                                {notification.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-brand-primary hover:text-brand-primary hover:bg-alert-bg-sky"
                                onClick={onViewAll}
                            >
                                View All Activity
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
