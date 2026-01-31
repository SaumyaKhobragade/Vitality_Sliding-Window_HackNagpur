import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert, Stethoscope, Info } from "lucide-react";

const OperationsAlerts = () => {
    return (
        <Card className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Operations Alerts
            </h3>
            <div className="space-y-4 flex-1">
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3">
                    <div className="mt-1">
                        <CircleAlert className="text-red-500 h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Capacity Warning: Metro General
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            ER Capacity at 98%. Redirecting non-critical trauma to St.
                            Mary&apos;s.
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">2 mins ago</p>
                    </div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg flex gap-3">
                    <div className="mt-1">
                        <Stethoscope className="text-yellow-600 dark:text-yellow-500 h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Staff Shortage: East Wing
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Pediatric unit reporting 2 nurse deficit for night shift.
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">15 mins ago</p>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-lg flex gap-3 opacity-75">
                    <div className="mt-1">
                        <Info className="text-gray-400 h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            System Maintenance
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Scheduled downtime for analytics module at 03:00 AM.
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2">1 hour ago</p>
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                className="w-full mt-4 py-2 text-sm text-primary font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
                View All Notifications
            </Button>
        </Card>
    );
};

export default OperationsAlerts;
