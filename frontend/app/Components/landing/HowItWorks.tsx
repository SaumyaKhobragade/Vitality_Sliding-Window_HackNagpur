import { ChartArea, Eye } from "lucide-react";
import { GrCluster } from "react-icons/gr";
const data = [
    {
        title: "Observe",
        description: "Secure data ingestion from secure CCTV feeds and real-time facility bed counts API. Privacy masking is applied at the edge before transmission.",
        icon: <Eye />
    },
    {
        title: "Analyze",
        description: "Centralized AI Triage logic &amp; Distress evaluation algorithms process incoming streams to identify bottlenecks and high-risk patient behaviors.",
        icon: <ChartArea />
    },
    {
        title: "Coordinate",
        description: "Automated dispatch of redirection orders to ambulances and security alerts to on-site medical staff, closing the operational loop.",
        icon: <GrCluster />
    }
]
export default function LandingHowItWorks() {
    return (
        <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/50">
            <div className="mx-auto flex max-w-[960px] flex-col px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                        How It Works
                    </h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Seamless integration into existing municipal infrastructure.
                    </p>
                </div>
                <div className="relative">
                    <div className="relative flex flex-col gap-8">
                        {data.map((item, index) => (
                            <div key={index} className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="flex size-10 p-1 items-center justify-center rounded-full bg-white border-2 border-primary text-[#0ea5e9] shadow-sm dark:bg-slate-800 dark:border-primary">
                                        {item.icon}
                                    </div>
                                    <div className="h-full w-0.5 bg-slate-200 dark:bg-slate-700 my-2"></div>
                                </div>
                                <div className="pb-8 pt-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-slate-600 dark:text-slate-400 max-w-xl">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
