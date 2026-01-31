import LandingNavBar from "@/app/Components/landing/NavBar";
import LandingHero from "@/app/Components/landing/Hero";
import LandingCapabilities from "@/app/Components/landing/Capabilities";
import LandingHowItWorks from "@/app/Components/landing/HowItWorks";
import LandingGovernance from "@/app/Components/landing/Governance";
import LandingFooter from "@/app/Components/landing/Footer";

export default function Page() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 font-display transition-colors duration-200">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <LandingNavBar />
                <LandingHero />
                <LandingCapabilities />
                <LandingHowItWorks />
                <LandingGovernance />
                <LandingFooter />
            </div>
        </div>
    );
}
