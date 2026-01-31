"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Plus, ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { SearchBar } from "@/app/Components/Common/SearchBar";
import { useSimulation } from "@/app/Components/Context/SimulationContext";

export const DashboardNavBar = () => {
    const { toggleSidebar } = useSidebar();
    const { isConnected } = useSimulation();

    return (
        <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 transition-colors duration-200">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="mr-4 md:hidden text-gray-500 hover:text-gray-700"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    City Overview
                </h1>
            </div>
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                <SearchBar
                    placeholder="Search hospitals, IDs, or alerts..."
                    variant="rounded"
                    size="md"
                />
            </div>
            <div className="flex items-center gap-4">
                <Button
                    size="icon"
                    className="rounded-full bg-primary text-white hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                </Button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${
                        isConnected 
                        ? "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800" 
                        : "bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800"
                    }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                            isConnected ? "bg-green-500" : "bg-red-500"
                        }`}></div>
                        <span className={`text-xs font-semibold ${
                            isConnected 
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        }`}>
                            {isConnected ? "Connected" : "Disconnected"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                            Darrell Steward
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Super Admin
                        </p>
                    </div>
                    <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                        <AvatarImage
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-lrC80wapEvCW34Xzr_70hcJUsqO4kLJNsLOFNh3WGsXpf8EpZHpmfI21nMcuX2400z9v6RRsMUk8CQxFvlResLxhR_Y2W1pYfcn_dOunGJIryxq-z4j0wKPsYWFqpXX5c515Ou2v7GoYkTcG-Npu8P9gcW_2LPci-tZegfdDur5l4ILVZrUYIYuqhc_k9REXitV87d0rJhVfpVXyPXvFG87xYUkSAntDOKqAiveNzCM9svZVRBUd3uXsDeRMFyZFwU3dkw65Rzo"
                            alt="Darrell Steward"
                        />
                        <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>
        </header>
    );
};