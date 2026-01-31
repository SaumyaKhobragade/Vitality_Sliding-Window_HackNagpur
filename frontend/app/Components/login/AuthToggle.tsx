"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AuthToggleProps {
    mode: "signin" | "register";
    setMode: (mode: "signin" | "register") => void;
}

export function AuthToggle({ mode, setMode }: AuthToggleProps) {
    return (
        <div className="mb-8 rounded-lg bg-muted p-1">
            <div className="flex h-10 w-full items-center">
                <button
                    onClick={() => setMode("signin")}
                    className={cn(
                        "flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-all",
                        mode === "signin"
                            ? "bg-white text-foreground shadow-sm dark:bg-neutral-800"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Sign In
                </button>
                <button
                    onClick={() => setMode("register")}
                    className={cn(
                        "flex h-full flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-all",
                        mode === "register"
                            ? "bg-white text-foreground shadow-sm dark:bg-neutral-800"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Create Account
                </button>
            </div>
        </div>
    );
}
