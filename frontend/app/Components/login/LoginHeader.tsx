import { Activity } from "lucide-react";

export function LoginHeader() {
    return (
        <div className="mb-8 flex flex-col gap-2 font-sans">
            <div className="flex items-center gap-2 mb-2 text-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                    ACHTS
                </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                Welcome back
            </h1>
            <p className="text-sm font-normal text-muted-foreground">
                Please enter your credentials to access the secure portal.
            </p>
        </div>
    );
}
