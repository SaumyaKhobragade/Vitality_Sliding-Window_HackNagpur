import { MdAltRoute, MdPolicy } from "react-icons/md";
const info = [
    {
        title: "Explainable Triage",
        description: "Policy-driven scheduling decisions ensuring fairness and transparency. Every AI decision is auditable and mapped to human-defined protocols.",
        icon: <MdPolicy size={25} />
    },
    {
        title: "Real-time Redirection",
        description: "Multi-hospital patient flow management to optimize city-wide resources. Dynamically balances load to prevent ER overcrowding.",
        icon: <MdAltRoute size={25} />
    },
    {
        title: "Distress AI",
        description: "Non-invasive behavioral signal detection via CCTV for early intervention. Privacy-first analysis detects agitation before escalation.",
        icon: <span className="material-symbols-outlined">psychology_alt</span>
    }
]
export default function LandingCapabilities() {
    return (
        <section className="py-12 sm:py-16">
            <div className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        System Capabilities
                    </h2>
                    <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                        Designed for resilience, transparency, and efficiency in critical
                        healthcare environments using ethical AI.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {info.map((item, index) => (
                        <div key={index} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#0ea5e9]/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                                {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
