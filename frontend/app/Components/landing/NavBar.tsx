"use client";

import Link from "next/link";
import { useAuth } from "@/app/Context/AuthContext";

export default function LandingNavBar() {
    const { user } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-transparent dark:border-slate-800  backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {/* icon */}
                    </div>
                    <Link href="/" className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                        Vitality
                    </Link>
                </div>
                <div className="hidden md:flex flex-1 items-center justify-end gap-8">
                    <nav className="flex items-center gap-6">
                        <Link
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
                            href="#"
                        >
                            Product
                        </Link>
                        <Link
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
                            href="#"
                        >
                            Science
                        </Link>
                        <Link
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
                            href="#"
                        >
                            Trust
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link 
                                href="/dashboard"
                                className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link 
                                href="/auth"
                                className="text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
                            >
                                Login
                            </Link>
                        )}
                        {!user && (
                            <button className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                                Request Demo
                            </button>
                        )}
                    </div>
                </div>
                <div className="md:hidden">
                    <button className="text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
