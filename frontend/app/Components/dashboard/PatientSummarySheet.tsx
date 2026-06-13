"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    ShieldAlert,
    Pill,
    HeartPulse,
    Scissors,
    FileText,
    Loader2,
    Check,
    Clipboard,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { getShortPatientId } from "@/lib/utils";

interface PatientSummaryData {
    patient_id: string;
    chronic_conditions: string[];
    allergies: string[];
    current_medications: string[];
    past_surgeries: string[];
    clinical_summary: string;
    retrieved_snippets: string[];
}

interface PatientSummarySheetProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName?: string;
}

const RAG_BACKEND_URL = process.env.NEXT_PUBLIC_RAG_BACKEND_URL || "http://localhost:8002";

export const PatientSummarySheet: React.FC<PatientSummarySheetProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName = "Unknown Patient"
}) => {
    const [summary, setSummary] = useState<PatientSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openSnippetIndex, setOpenSnippetIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && patientId) {
            fetchSummary();
        } else {
            setSummary(null);
        }
    }, [isOpen, patientId]);

    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${RAG_BACKEND_URL}/api/patients/${patientId}/summary`);
            if (!response.ok) {
                throw new Error("Failed to fetch summary from RAG backend");
            }
            const data = await response.json();
            setSummary(data);
        } catch (err) {
            console.error("Error fetching patient summary:", err);
            toast.error("Could not retrieve medical summary. Make sure the Python RAG server is running.");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopySummary = () => {
        if (!summary) return;
        const textToCopy = `
Patient Summary (ID: ${getShortPatientId(patientId)})
--------------------------------------------------
Chronic Conditions: ${summary.chronic_conditions.join(", ")}
Allergies: ${summary.allergies.join(", ")}
Current Medications: ${summary.current_medications.join(", ")}
Past Surgeries: ${summary.past_surgeries.join(", ")}

Clinical Summary:
${summary.clinical_summary}
        `.trim();

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast.success("Summary copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Slide-out Panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-white dark:bg-gray-950 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
                    
                    {/* Header */}
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-850 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                    <FileText className="h-5 w-5" />
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Patient Clinical Profile
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {patientName} • ID: <span className="font-mono font-medium text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">{getShortPatientId(patientId)}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {summary && (
                                <button
                                    onClick={handleCopySummary}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Copy clinical record"
                                >
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Querying vector database & synthesizing summary...
                                </p>
                            </div>
                        ) : summary ? (
                            <>
                                {/* Structured Clinical Facts Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Allergies */}
                                    <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-2.5">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span>Allergies</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {summary.allergies.map((allergy, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-xs font-semibold">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Current Medications */}
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-2.5">
                                            <Pill className="h-4 w-4" />
                                            <span>Medications</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {summary.current_medications.map((med, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-semibold">
                                                    {med}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chronic Conditions */}
                                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold mb-2.5">
                                            <HeartPulse className="h-4 w-4" />
                                            <span>Chronic Conditions</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {summary.chronic_conditions.map((cond, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold">
                                                    {cond}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Past Surgeries */}
                                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-2.5">
                                            <Scissors className="h-4 w-4" />
                                            <span>Past Surgeries</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {summary.past_surgeries.map((surgery, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                                                    {surgery}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Summary Block */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                        Clinical AI synthesis
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 text-gray-700 dark:text-gray-300 leading-relaxed text-sm shadow-inner prose dark:prose-invert">
                                        {summary.clinical_summary.split("\n\n").map((para, idx) => (
                                            <p key={idx} className={idx > 0 ? "mt-3" : ""}>
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Source Records Accordion */}
                                {summary.retrieved_snippets.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                            Source Patient Records
                                        </h3>
                                        <div className="space-y-2">
                                            {summary.retrieved_snippets.map((snippet, idx) => {
                                                const isSnippetOpen = openSnippetIndex === idx;
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenSnippetIndex(isSnippetOpen ? null : idx)}
                                                            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-850 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                                                        >
                                                            <span className="truncate max-w-[80%] flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-gray-400" />
                                                                Record Snippet #{idx + 1}
                                                            </span>
                                                            {isSnippetOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                                                        </button>
                                                        {isSnippetOpen && (
                                                            <div className="px-4 py-3 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-650 dark:text-gray-400 font-mono leading-normal whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                                {snippet}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No profile details found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
