import { Activity, Network, Shield, Brain } from "lucide-react";

export function BrandingPanel() {
    return (
        <div className="relative hidden w-0 flex-1 flex-col justify-between overflow-hidden bg-slate-900 md:flex lg:w-[55%] xl:w-[60%]">
            {/* Background Image/Gradient with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"
                aria-hidden="true"
            />
            <div className="absolute inset-0 z-0 bg-linear-to-br from-slate-900 via-[#0b2c4d] to-primary/80 opacity-90" />

            {/* Abstract decorative elements */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-full bg-linear-to-t from-slate-900 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 flex h-full flex-col p-12 lg:p-16">
                {/* Logo Area */}
                <div className="flex items-center gap-3 text-white/90">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-medium tracking-wide">
                        ACHTS Platform
                    </span>
                </div>

                {/* Main Content Centered */}
                <div className="mt-auto mb-auto max-w-lg">
                    <h2 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
                        Intelligent
                        <br />
                        <span className="text-sky-400">City-Scale Triage</span>
                    </h2>
                    <p className="mb-10 text-lg leading-relaxed text-white/80">
                        Orchestrating emergency response with precision and speed. The
                        unified portal for city administrators and hospital operators.
                    </p>

                    {/* Benefits List */}
                    <div className="flex flex-col gap-6">
                        {/* Item 1 */}
                        <div className="flex gap-4">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400">
                                <Network className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Real-time Coordination
                                </h3>
                                <p className="text-sm text-white/60">
                                    Seamless data flow between EMS and hospital intake units.
                                </p>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="flex gap-4">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Explainable AI
                                </h3>
                                <p className="text-sm text-white/60">
                                    Transparent algorithmic decision support for triage
                                    prioritization.
                                </p>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="flex gap-4">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Secure Data Handling
                                </h3>
                                <p className="text-sm text-white/60">
                                    HIPAA-compliant architecture with end-to-end encryption.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Status */}
                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8 text-xs text-white/40">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>System Operational</span>
                    </div>
                    <span>v2.4.0 (Stable)</span>
                </div>
            </div>
        </div>
    );
}
