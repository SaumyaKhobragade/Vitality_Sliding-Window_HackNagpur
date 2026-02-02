"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Timer,
  Route,
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  PersonStanding,
  Stethoscope,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { RedirectionDecision, Treatment } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as ApiClient from "@/lib/api-client";
import { formatPatientId, getShortPatientId } from "@/lib/utils";
import { useSimulation } from "@/app/Components/Context/SimulationContext";

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendValue?: string;
  trendColor?: string;
}) => (
  <Card className="p-6 bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex items-baseline gap-3">
      <p className="text-4xl font-bold text-foreground">{value}</p>
      {trend && (
        <div
          className={`flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${trendColor === "green"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
            : trendColor === "red"
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
        >
          {trendColor === "green" && <TrendingUp className="h-4 w-4" />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  </Card>
);

// Decision Type Badge
const DecisionTypeBadge = ({ type }: { type: string }) => {
  const styles = {
    safe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    conditional:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    standard:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type as keyof typeof styles]}`}
    >
      <span className="size-1.5 rounded-full bg-current"></span>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      label: "Completed",
    },
    pending: {
      icon: AlertTriangle,
      color: "text-blue-500",
      label: "Pending",
    },
    failed: {
      icon: XCircle,
      color: "text-red-500",
      label: "Failed",
    },
  };

  const {
    icon: Icon,
    color,
    label,
  } = config[status as keyof typeof config] || config.pending;

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};

// Helper functions for treatments
const getProgressColor = (color: string) => {
  const colors: Record<string, string> = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    teal: "bg-teal-500",
  };
  return colors[color] || "bg-gray-500";
};

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300",
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300",
  };
  return (
    colors[color] ||
    "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-300"
  );
};

const DecisionMonitorPage = () => {
  const [decisions, setDecisions] = useState<RedirectionDecision[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [decisionTypeFilter, setDecisionTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { hospitals, redirectionEvents, totalRedirections, logs, avgWaitTime } = useSimulation();
  const { socketService } = useRealtime();

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching redirection decisions...");
      const data = await ApiClient.getRedirectionDecisions();
      console.log("Fetched decisions:", data.length, data);
      setDecisions(data);
    } catch (error) {
      console.error("Failed to load decisions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTreatments = useCallback(async () => {
    try {
      const treatmentsData = await ApiClient.getTreatments();
      const mappedTreatments = treatmentsData.map((record) => {
        let icon = <Stethoscope className="h-5 w-5" />;
        if (record.type === "Trauma")
          icon = <PersonStanding className="h-5 w-5" />;
        if (record.type === "Cardiac") icon = <Heart className="h-5 w-5" />;

        const start = new Date(record.startedAt).getTime();
        const diff = Math.max(0, Date.now() - start);
        const minutes = Math.floor(diff / 60000);
        const elapsed =
          minutes > 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m elapsed`
            : `${minutes}m elapsed`;

        return {
          id: record.id,
          patientId: record.patientId,
          type: record.type,
          doctor: record.doctorName,
          location: record.location,
          elapsed,
          progress: record.progress,
          icon,
          color: record.colorCode,
        };
      });
      setTreatments(mappedTreatments);
    } catch (error) {
      console.error("Failed to load treatments", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (mounted) {
      console.log("Decision Monitor: Initial fetch");
      fetchDecisions();
      fetchTreatments();
    }
  }, [mounted, fetchDecisions, fetchTreatments]);

  // Refetch decisions when redirectionEvents change (from SimulationContext SSE subscription)
  useEffect(() => {
    if (mounted && redirectionEvents.length > 0) {
      console.log("Decision Monitor: Refetching due to new redirection events", redirectionEvents.length);
      fetchDecisions();
    }
  }, [mounted, redirectionEvents.length, fetchDecisions]);

  // Debug: Log context data
  useEffect(() => {
    console.log("Decision Monitor Context State:", {
      hospitalsCount: Object.keys(hospitals).length,
      redirectionEventsCount: redirectionEvents.length,
      totalRedirections,
      decisionsCount: decisions.length,
      loading,
      mounted
    });
  }, [hospitals, redirectionEvents, totalRedirections, decisions, loading, mounted]);

  const handleToggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getHospitalName = (id: string, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    return hospitals[id]?.name || id;
  };

  // Filter data based on search and filters
  const filteredDecisions = decisions.filter((decision) => {
    const fromName = getHospitalName(decision.fromHospital, decision.fromHospitalName);
    const toName = getHospitalName(decision.toHospital, decision.toHospitalName);

    const matchesSearch =
      searchQuery === "" ||
      decision.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "any" || decision.status === statusFilter;

    const matchesDecisionType =
      decisionTypeFilter === "all" ||
      decision.decisionType === decisionTypeFilter;

    return matchesSearch && matchesStatus && matchesDecisionType;
  });

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-360 mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-foreground">
              Redirection Decision Monitor
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              City-wide coordination and audit log
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Log
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-primary/20"
              onClick={fetchDecisions}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Live Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Redirects"
            value={totalRedirections > 0
              ? totalRedirections
              : logs.filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect')).length}
            icon={Route}
            trend="-"
            trendColor="neutral"
          />
          {/* <StatsCard
            title="Avg Wait Saved"
            value={(() => {
              const redirectCount = totalRedirections > 0
                ? totalRedirections
                : logs.filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect')).length;
              // Estimate: each redirect saves ~20-40% of average wait time
              if (redirectCount > 0 && avgWaitTime > 0) {
                return `${Math.round(avgWaitTime * 0.3 * redirectCount)}m`;
              }
              return redirectCount > 0 ? `~${Math.round(redirectCount * 5)}m` : '-';
            })()}
            icon={Timer}
            trend={totalRedirections > 0 || logs.filter(l => l.message.includes('🔄')).length > 0 ? "Estimated" : "-"}
            trendColor="green"
          /> */}
          {/* <StatsCard
            title="Failed Redirects"
            value={decisions.filter((d) => d.status === "failed").length}
            icon={AlertTriangle}
            trend="-"
            trendColor="neutral"
          /> */}
        </div>

        {/* Live Redirection Events Section */}
        <div className="rounded-xl border border-border bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Live Redirection Events</h3>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-muted-foreground">
                Real-time • {totalRedirections > 0 ? totalRedirections : logs.filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect')).length} total
              </span>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Show SSE-based redirection events if available */}
            {redirectionEvents.length > 0 ? (
              redirectionEvents.slice(0, 50).map((event, idx) => (
                <div
                  key={`${event.patientId}-${event.timestamp}-${idx}`}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                      <Route className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium text-primary">
                          {getShortPatientId(event.patientId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          redirected
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          {event.sourceHospitalName ||
                            getHospitalName(event.sourceHospitalId)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {event.targetHospitalName ||
                            getHospitalName(event.targetHospitalId)}
                        </span>
                        {event.benefitScore !== undefined && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              Benefit: {event.benefitScore.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback: Show log entries that contain redirection info
              logs.filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect')).length > 0 ? (
                logs
                  .filter(l => l.message.includes('🔄') || l.message.toLowerCase().includes('redirect'))
                  .slice(0, 50)
                  .map((log, idx) => (
                    <div
                      key={`log-${log.id}-${idx}`}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                          <Route className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.level === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : log.level === 'INFO'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                              {log.level}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{log.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No redirection events yet. Start the simulation or wait for
                  redirections to appear in real-time.
                </p>
              )
            )}
          </div>
        </div>

        {/* Active Treatments Section */}
        <div className="rounded-xl border border-border bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Active Treatments City-Wide</h3>
            <span className="text-xs text-muted-foreground">Updates live</span>
          </div>
          <div className="space-y-6">
            {treatments.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No active treatments.
              </p>
            )}
            {treatments.map((treatment) => (
              <div key={treatment.id} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-full ${getIconBgColor(treatment.color)}`}
                    >
                      {treatment.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {getShortPatientId(treatment.patientId)} (
                        {treatment.type})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {treatment.doctor} · {treatment.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {treatment.elapsed}
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-accent">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full ${getProgressColor(treatment.color)}`}
                    style={{ width: `${treatment.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table with Filters */}
        <div className="flex flex-col rounded-xl border border-border bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Search Patient ID or Hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={decisionTypeFilter}
              onValueChange={setDecisionTypeFilter}
            >
              <SelectTrigger className="w-auto h-9">
                <SelectValue placeholder="Decision Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-auto h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-35">Patient ID</TableHead>
                  <TableHead className="w-75">Route (From → To)</TableHead>
                  <TableHead className="w-40">Decision Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-30">Time</TableHead>
                  <TableHead className="w-35">Status</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading decisions...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredDecisions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No decisions found.
                    </TableCell>
                  </TableRow>
                )}
                {filteredDecisions.map((decision) => (
                  <React.Fragment key={decision.id}>
                    {/* Main Row */}
                    <TableRow
                      onClick={() => handleToggleRow(decision.id)}
                      className={`cursor-pointer hover:bg-muted/50 ${expandedRow === decision.id
                        ? "bg-primary/5 dark:bg-primary/5 border-l-4 border-l-primary"
                        : ""
                        }`}
                    >
                      <TableCell>
                        <span className="font-mono text-sm text-primary font-medium bg-primary/5 px-2 py-1 rounded">
                          {formatPatientId(decision.patientId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <span className="font-medium">
                            {getHospitalName(decision.fromHospital, decision.fromHospitalName)}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getHospitalName(decision.toHospital, decision.toHospitalName)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DecisionTypeBadge type={decision.decisionType} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {decision.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(decision.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={decision.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        {expandedRow === decision.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {expandedRow === decision.id &&
                      decision.confidenceScore && (
                        <TableRow className="bg-slate-50/80 dark:bg-slate-800/30 border-l-4 border-l-primary/30">
                          <TableCell colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Confidence Score */}
                              <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-end">
                                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Redirect Confidence Score
                                  </p>
                                  <span className="text-2xl font-bold text-foreground">
                                    {decision.confidenceScore}
                                    <span className="text-sm font-normal text-muted-foreground">
                                      /100
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full transition-all"
                                    style={{
                                      width: `${decision.confidenceScore}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {decision.confidenceScore >= 80
                                    ? "High confidence - Optimal bed availability and transport time."
                                    : decision.confidenceScore >= 60
                                      ? "Moderate confidence - Acceptable conditions for redirection."
                                      : "Low confidence - Limited options or constraints present."}
                                </p>
                              </div>

                              {/* Policy & Constraints */}
                              <div className="flex flex-col gap-3 lg:col-span-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border pb-3">
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                      Policy Applied
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                      {decision.policyApplied}
                                    </span>
                                  </div>
                                  {decision.constraints && (
                                    <div className="sm:border-l sm:border-border sm:pl-4">
                                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                        Constraints Applied
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {decision.constraints.map(
                                          (constraint, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center gap-1 text-xs text-foreground bg-background px-2 py-1 rounded border border-border shadow-sm"
                                            >
                                              {constraint}
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-1">
                                  <button className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2">
                                    View Full Audit Log
                                  </button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Flag className="h-4 w-4 mr-1" />
                                    Flag Decision
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/20">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredDecisions.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {decisions.length}
              </span>{" "}
              decisions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DecisionMonitorPage;
