import { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LogEntry } from "@/lib/types";

interface EventStreamProps {
    logs: LogEntry[];
}

export function EventStream({ logs }: EventStreamProps) {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Check if user is scrolled near the bottom
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        setAutoScroll(isNearBottom);
    };

    // Scroll to bottom only if autoScroll is enabled
    useEffect(() => {
        if (autoScroll) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll]);

    return (
        <Card className="border-none shadow-xl bg-slate-900 h-full flex flex-col overflow-hidden ring-1 ring-slate-800">
            <CardHeader className="bg-slate-950/50 py-3 border-b border-white/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-slate-100">
                    <TerminalIcon className="w-4 h-4" />
                    <span className="font-mono text-sm font-semibold tracking-wide">
                        Event Stream
                    </span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col relative">
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-xs max-h-[500px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                    {logs.map((log, index) => (
                        <div
                            key={log.id}
                            className={cn(
                                "flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300",
                                { "opacity-50": index < logs.length - 10 }, // dim older logs
                            )}
                        >
                            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                            <div className="break-words">
                                <span
                                    className={cn(
                                        "font-bold mr-2",
                                        log.level === "INFO" && "text-blue-400",
                                        log.level === "WARN" && "text-amber-400",
                                        log.level === "CRITICAL" && "text-red-500",
                                        log.level === "SUCCESS" && "text-green-400",
                                        log.level === "SYSTEM" && "text-purple-400",
                                    )}
                                >
                                    {log.level}:
                                </span>
                                <span className="text-slate-300">{log.message}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-slate-950/30 border-t border-white/5">
                    <input
                        type="text"
                        placeholder="Inject command..."
                        className="w-full bg-slate-800/50 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                    <div className="text-[10px] text-slate-600 mt-1.5 flex items-center font-mono">
                        <span className="text-blue-500 mr-1">{">"}</span> Ready for input
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
