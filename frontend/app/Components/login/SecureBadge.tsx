import { ShieldCheck } from "lucide-react";

export function SecureBadge() {
    return (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-border bg-neutral-50 py-3 text-muted-foreground dark:bg-neutral-900">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span className="text-xs font-medium">256-bit SSL Secure Connection</span>
        </div>
    );
}
