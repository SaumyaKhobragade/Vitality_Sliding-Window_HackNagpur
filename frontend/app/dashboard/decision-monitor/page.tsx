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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { RedirectionDecision } from "@/lib/types";
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
import { useSimulation } from "@/app/Components/Context/SimulationContext";
import { useRealtime } from "@/app/Components/Context/RealtimeContext";

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

  const { icon: Icon, color, label } = config[status as keyof typeof config] || config.pending;

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};

const DecisionMonitorPage = () => {
  const [decisions, setDecisions] = useState<RedirectionDecision[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [decisionTypeFilter, setDecisionTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { hospitals } = useSimulation();
  const { socketService } = useRealtime();

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    try {
        const data = await ApiClient.getRedirectionDecisions();
        setDecisions(data);
    } catch (error) {
        console.error("Failed to load decisions", error);
    } finally {
        setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  // Subscribe to SSE for real-time redirection events
  useEffect(() => {
    socketService.subscribe("/topic/events", (event: any) => {
      // Refetch decisions when redirection events occur
      if (event.type === "REDIRECTION" || event.type === "PATIENT_REDIRECTED") {
        fetchDecisions();
      }
    });

    return () => {
      socketService.unsubscribe("/topic/events");
    };
  }, [socketService, fetchDecisions]);

  const handleToggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getHospitalName = (id: string) => {
      return hospitals[id]?.name || id;
  };

  // Filter data based on search and filters
  const filteredDecisions = decisions.filter((decision) => {
    const fromName = getHospitalName(decision.fromHospital);
    const toName = getHospitalName(decision.toHospital);
    
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
            <Button className="gap-2 shadow-lg shadow-primary/20" onClick={fetchDecisions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Live Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Redirects Today"
            value={decisions.length}
            icon={Route}
            trend="-"
            trendColor="neutral"
          />
          <StatsCard
            title="Avg Wait Saved"
            value="-"
            icon={Timer}
            trend="-"
            trendColor="neutral"
          />
          <StatsCard
            title="Failed Redirects"
            value={decisions.filter(d => d.status === "failed").length}
            icon={AlertTriangle}
            trend="-"
            trendColor="neutral"
          />
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
                        <TableCell colSpan={7} className="text-center py-8">Loading decisions...</TableCell>
                    </TableRow>
                )}
                {!loading && filteredDecisions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">No decisions found.</TableCell>
                    </TableRow>
                )}
                {filteredDecisions.map((decision) => (
                  <React.Fragment key={decision.id}>
                    {/* Main Row */}
                    <TableRow
                      className={`${expandedRow === decision.id
                          ? "bg-primary/5 dark:bg-primary/5 border-l-4 border-l-primary"
                          : ""
                        }`}
                    >
                      <TableCell>
                        <span className="font-mono text-sm text-primary font-medium bg-primary/5 px-2 py-1 rounded">
                          {decision.patientId.substring(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <span className="font-medium">
                            {getHospitalName(decision.fromHospital)}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getHospitalName(decision.toHospital)}
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
                          {new Date(decision.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={decision.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleToggleRow(decision.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {expandedRow === decision.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
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
                                  High confidence based on bed availability and
                                  transport time.
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