import { LogEntry } from "@/lib/types";

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: "1",
    timestamp: "10:41:55",
    level: "SYSTEM",
    message: "System initialization complete.",
  },
  {
    id: "2",
    timestamp: "10:42:01",
    level: "INFO",
    message: "Node 14 connected.",
  },
  {
    id: "3",
    timestamp: "10:42:05",
    level: "SYSTEM",
    message: "Policy switched to 'Standard Triage'.",
  },
];

export const INITIAL_CHART_DATA = {
  labels: ["0m", "10m", "20m", "30m", "40m", "50m", "60m"],
  datasets: [
    {
      label: "Wait Times",
      data: [10, 15, 22, 25, 38, 48, 52],
      borderColor: "#0EA5E9", // brand-primary
      backgroundColor: "rgba(14, 165, 233, 0.1)",
      borderWidth: 3,
      tension: 0.4,
      fill: true,
    },
    {
      label: "Queue Length",
      data: [5, 8, 10, 15, 25, 30, 35],
      borderColor: "#94A3B8", // neutral-text-muted
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 0,
    },
  ],
};

export const LOG_TEMPLATES = {
  waitTimesSpike: (val: number) => `Wait times spiking (+${val}%).`,
  rerouting: "Rerouting ambulances to West Wing.",
  surge: (surge: number) =>
    `Surge initiated at Metro North (${surge}x Multiplier).`,
};

export const DISTRESS_FREQUENCIES = ["LOW", "MED", "HIGH"] as const;

export const POLICY_OPTIONS = [
  { value: "standard", label: "Standard Triage" },
  { value: "crisis", label: "Crisis Protocol A" },
  { value: "mass-casualty", label: "Mass Casualty" },
];
