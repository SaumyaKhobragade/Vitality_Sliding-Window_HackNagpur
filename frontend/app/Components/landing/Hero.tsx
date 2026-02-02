import { FaEarthAmericas } from "react-icons/fa6";

export default function LandingHero() {
    return (
        <section className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full h-screen">
                <div className="relative overflow-hidden  bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 to-slate-900/40 z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center opacity-60"
                            data-alt="Abstract blue data visualization network resembling neural pathways or city infrastructure"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGOxtrVHcULdsuEbRYuYViC4XGI4Rukgi_F4rykqdram0-4vZflH6r-5tI7PfV83mC6FCDEKvH8E6Pzsljrw88BbmPezqPEuH45VAIeP3rx1p0eM0LSLurwAMSnE-Nm7K0xIy4-UCe-6nQYjob9k6FFoD3vDBjQnjsLuMO6xRnaxjRnfNwedReVcwOIh-qDIUGxagLSCbp55CUFV787tIoHMhLUcK2_bRfwjDi4R57fRv9C0u0kDRCkFd1EV7kNhApaXj12BzgK7s')",
                            }}
                        ></div>
                    </div>
                    <div className="relative z-20 flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
                        <div className="max-w-2xl">
                            <div className="bg-[#0ea5e9]/40 inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-semibold text-system-info backdrop-blur-sm mb-6 border border-primary/20 ">
                                <FaEarthAmericas />
                                <span className="text-[#0ea5e9]">
                                    City-Scale Deployment Ready
                                </span>
                            </div>
                            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Next-Generation
                                <br />
                                <span className="text-[#0ea5e9]">Hospital Coordination</span>
                            </h1>
                            <p className="mb-8 text-lg font-normal leading-relaxed text-slate-300 sm:text-xl max-w-lg">
                                Intelligent, real-time triage redirection and behavioral
                                distress monitoring for resilient healthcare systems.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex h-12 items-center justify-center rounded-lg bg-[#0ea5e9] px-8 text-base font-bold text-white transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent">
                                    Request Demo
                                </button>
                                <button className="flex h-12 items-center justify-center rounded-lg border border-slate-600 bg-slate-800/50 px-8 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-slate-700/50 focus:ring-2 focus:ring-slate-500">
                                    System Overview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
