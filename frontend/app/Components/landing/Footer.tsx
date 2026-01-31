import { LocationEdit, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";

export default function LandingFooter() {
    return (
        <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-background-dark">
            <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
                                {/* icon */}
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                Vitality
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Advancing healthcare resilience through intelligent coordination.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Platform
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    Triage Engine
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    Distress AI
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    City Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    Security
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                                    href="#"
                                >
                                    Partners
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Mail />
                                contact@Vitality.gov
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <MapPin />
                                Washington, DC
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            © 2024 Vitality. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link
                                className="text-sm text-slate-500 hover:text-primary dark:text-slate-400"
                                href="#"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                className="text-sm text-slate-500 hover:text-primary dark:text-slate-400"
                                href="#"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
