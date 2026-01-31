"use client";

import React, { useState } from "react";
import { DashboardNavBar } from "@/app/Components/Navigation/DashboardNavBar";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { RedirectionDecision } from "@/lib/types";
import { DataTable, FilterOption } from "@/app/Components/Common/DataTable";
import { ColumnDef } from "@tanstack/react-table";

// Mock data
const mockDecisions: RedirectionDecision[] = [
  {
    id: "1",
    patientId: "8a7f...9b2",
    fromHospital: "General Hosp",
    toHospital: "City Clinic",
    decisionType: "safe",
    reason: "Bed Availability < 5%",
    time: "10m ago",
    status: "completed",
  },
  {
    id: "2",
    patientId: "3b2c...1a4",
    fromHospital: "Memorial",
    toHospital: "County",
    decisionType: "conditional",
    reason: "Specialist Req",
    time: "25m ago",
    status: "pending",
    confidenceScore: 92,
    policyApplied: "POL-2023-A (Trauma Divert)",
    constraints: ["Specialist: Neurologist", "Transport < 20m"],
  },
  {
    id: "3",
    patientId: "c4d1...8e2",
    fromHospital: "Westside",
    toHospital: "Trauma Ctr",
    decisionType: "standard",
    reason: "Load Balancing",
    time: "42m ago",
    status: "failed",
  },
  {
    id: "4",
    patientId: "9b2a...3f1",
    fromHospital: "St. Mary's",
    toHospital: "North Clinic",
    decisionType: "safe",
    reason: "Overflow",
    time: "1h ago",
    status: "completed",
  },
];

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

  const { icon: Icon, color, label } = config[status as keyof typeof config];

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};

// Define table columns
const columns: ColumnDef<RedirectionDecision>[] = [
  {
    accessorKey: "patientId",
    header: "Patient ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-primary font-medium bg-primary/5 px-2 py-1 rounded">
        {row.original.patientId}
      </span>
    ),
  },
  {
    id: "route",
    header: "Route (From → To)",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="font-medium">{row.original.fromHospital}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.toHospital}</span>
      </div>
    ),
  },
  {
    accessorKey: "decisionType",
    header: "Decision Type",
    cell: ({ row }) => <DecisionTypeBadge type={row.original.decisionType} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.reason}
      </span>
    ),
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.time}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

// Filter options for DataTable
const filterOptions: FilterOption[] = [
  {
    id: "decisionType",
    label: "Decision Type",
    options: [
      { value: "safe", label: "Safe" },
      { value: "conditional", label: "Conditional" },
      { value: "standard", label: "Standard" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

const DecisionMonitorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavBar />

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
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <RefreshCw className="h-4 w-4" />
              Live Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Redirects Today"
            value={142}
            icon={Route}
            trend="+12%"
            trendColor="green"
          />
          <StatsCard
            title="Avg Wait Saved"
            value="45 min"
            icon={Timer}
            trend="↑ 5 min"
            trendColor="green"
          />
          <StatsCard
            title="Failed Redirects"
            value={3}
            icon={AlertTriangle}
            trend="0 change"
            trendColor="neutral"
          />
        </div>

        {/* DataTable with filters */}
        <DataTable
          columns={columns}
          data={mockDecisions}
          filters={filterOptions}
          showFilters={true}
        />
      </main>
    </div>
  );
};

export default DecisionMonitorPage;
