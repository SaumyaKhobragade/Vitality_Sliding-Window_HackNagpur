import { ShieldUser } from "lucide-react";
import Link from "next/link";

export default function LandingGovernance() {
    return (
        <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-screen">
                <div className="min-h-screen bg-slate-900 p-8 sm:p-12 shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <ShieldUser />
                                <span className="text-sm font-bold uppercase tracking-widest  text-sky-500">
                                    Human-in-the-loop Governance
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">
                                Observational Trust Interface
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                We believe technology should augment, not replace, medical
                                judgment. Vitality is built on a philosophy of "Observational
                                Trust," where AI provides actionable intelligence while human
                                oversight retains the final authority on critical care
                                decisions.
                            </p>
                            <Link
                                className="inline-flex items-center gap-2 text-white font-semibold hover:text-primary transition-colors"
                                href="#"
                            >
                                Read our Ethics Whitepaper
                                <span className="material-symbols-outlined text-sm">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                        <div className="w-full md:w-1/3">
                            <div className="mt-15 aspect-square w-full rounded-xl bg-slate-800 border border-slate-700 p-6 flex flex-col items-center justify-center text-center">
                                <div className="text-4xl font-black text-white mb-2">100%</div>
                                <div className="text-sm text-slate-400">
                                    Audit Trail Retention
                                </div>
                                <div className="my-4 w-full h-px bg-slate-700"></div>
                                <div className="text-4xl font-black text-white mb-2">0</div>
                                <div className="text-sm text-slate-400">
                                    Black-box Decisions
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
