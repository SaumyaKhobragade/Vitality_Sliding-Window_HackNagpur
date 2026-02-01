"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Hospital } from "@/lib/types";
import * as ApiClient from "@/lib/api-client";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";

const HospitalStatusList = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const { socketService } = useRealtime();

    // Fetch hospitals from database
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await ApiClient.getHospitals();
                setHospitals(data);
            } catch (error) {
                console.error("Failed to fetch hospitals", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();

        // Subscribe to backend hospital updates only
        socketService.subscribe("/topic/hospital", (newHospital: Hospital) => {
            setHospitals((prev) => {
                const index = prev.findIndex(h => h.id === newHospital.id);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = newHospital;
                    return updated;
                } else {
                    return [...prev, newHospital];
                }
            });
        });

        return () => {
            socketService.unsubscribe("/topic/hospital");
        };
    }, [socketService]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "NORMAL":
                return {
                    badge:
                        "bg-severity-stable/10 text-severity-stable border-severity-stable/20",
                    bar: "bg-severity-stable",
                    icon: "bg-severity-stable/10 text-severity-stable",
                };
            case "BUSY":
                return {
                    badge:
                        "bg-severity-urgent/10 text-severity-urgent border-severity-urgent/20",
                    bar: "bg-severity-urgent",
                    icon: "bg-severity-urgent/10 text-severity-urgent",
                };
            case "CRITICAL":
                return {
                    badge:
                        "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
                    bar: "bg-severity-critical",
                    icon: "bg-severity-critical/10 text-severity-critical",
                };
            default:
                return {
                    badge:
                        "bg-severity-minimal/10 text-severity-minimal border-severity-minimal/20",
                    bar: "bg-severity-minimal",
                    icon: "bg-severity-minimal/10 text-severity-minimal",
                };
        }
    };

    const getStatus = (hospital: Hospital) => {
        if (hospital.maxCapacity === 0) return "NORMAL";
        const load = (hospital.totalQueueSize / hospital.maxCapacity) * 100;
        if (load < 30) return "NORMAL";
        if (load < 70) return "BUSY";
        return "CRITICAL";
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="col-span-full text-center p-10 text-gray-500 border border-dashed rounded-xl">
                    Loading hospitals from database...
                </div>
            </div>
        );
    }

    if (hospitals.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="col-span-full text-center p-10 text-gray-500 border border-dashed rounded-xl">
                    No hospitals found in database
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hospitals.map((item, index) => {
                const status = getStatus(item);
                const styles = getStatusStyles(status);
                const specialties = Object.keys(item.waitingRooms || {});

                return (
                    <Card
                        key={item.id}
                        className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${styles.icon}`}
                                >
                                    {item.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {item.id}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`px-2 py-1 rounded-md text-xs font-bold border ${styles.badge}`}
                            >
                                {status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {specialties.map((specialty, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded border border-gray-200 dark:border-gray-600"
                                >
                                    {specialty}
                                </span>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Queue Size
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {item.totalQueueSize}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full w-1/4 rounded-full ${styles.bar}`}
                                        style={{
                                            width: `${Math.min((item.totalQueueSize / item.maxCapacity) * 100, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                        Active Doctors
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {item.activeDoctorCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                        Capacity
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        {item.maxCapacity}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Link
                                className="text-sm text-primary font-medium hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1"
                                href={`/dashboard/queue-details?hospital=${item.id}`}
                            >
                                Details
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default HospitalStatusList;