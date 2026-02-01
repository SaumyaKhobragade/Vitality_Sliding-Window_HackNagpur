"use client";

import React, { useState } from "react";
import { useSimulation } from "../Context/SimulationContext";
import { formatPatientId } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RedirectionMonitor = () => {
  // These values persist across simulation resets and accumulate indefinitely
  // They are NOT cleared when the simulation is reset
  const { redirectionEvents, totalRedirections } = useSimulation();

  // Calculate Stats
  const totalRedirects = totalRedirections;
  // Mock calculation for wait saved (in a real app, backend would send this)
  const avgWaitSaved =
    totalRedirects > 0 ? Math.round(45 + Math.random() * 5) : 0;
  const failedRedirects = 3; // Mocked count as we don't track failures in events yet

  // Filter/Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredEvents = redirectionEvents.filter(
    (e) =>
      e.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sourceHospitalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.targetHospitalId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header / Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Redirection Decision Monitor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            City-wide coordination and audit log
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Log
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Live Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL REDIRECTS TODAY"
          value={totalRedirects}
          trend="+12%"
          icon={<TrendingUp className="w-4 h-4" />}
          primary
        />
        <StatCard
          title="AVG WAIT SAVED"
          value={`${avgWaitSaved} min`}
          trend="↑ 5 min"
          trendColor="text-green-500"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="FAILED REDIRECTS"
          value={failedRedirects}
          trend="0 change"
          trendColor="text-gray-400"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search Patient ID or Hospital..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <option>All Types</option>
              <option>Safe</option>
              <option>Conditional</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Route (From → To)</th>
                <th className="px-4 py-3">Decision Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredEvents.map((event, index) => (
                  <React.Fragment key={index}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer ${expandedId === event.patientId + index ? "bg-gray-50 dark:bg-gray-800/30" : ""}`}
                      onClick={() => toggleExpand(event.patientId + index)} // Ensure unique key
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatPatientId(event.patientId)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {event.sourceHospitalId}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {event.targetHospitalId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          type={
                            index % 3 === 0
                              ? "safe"
                              : index % 3 === 1
                                ? "conditional"
                                : "standard"
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {event.reason || "Load Balancing"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {expandedId === event.patientId + index ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </motion.tr>

                    {/* Expanded Details Row */}
                    {expandedId === event.patientId + index && (
                      <tr className="bg-gray-50 dark:bg-gray-900/40">
                        <td colSpan={7} className="px-4 py-4">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            <div className="p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  Redirect Confidence Score
                                </h4>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  92
                                  <span className="text-sm text-gray-400 font-normal">
                                    /100
                                  </span>
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                  style={{ width: "92%" }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500">
                                High confidence based on bed availability
                                prediction and transport time analysis.
                              </p>
                            </div>

                            <div className="space-y-4 p-4">
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                  Policy Applied
                                </h4>
                                <div className="inline-block bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs font-mono text-gray-700 dark:text-gray-300">
                                  POL-2023-A (Trauma Divert)
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                  Constraints Applied
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2.5 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
                                    Specialist: Neurologist
                                  </span>
                                  <span className="px-2.5 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
                                    Transport &lt; 20m
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-end pt-2">
                                <button className="text-red-500 text-xs font-medium hover:text-red-600 hover:underline flex items-center gap-1.5 transition-colors">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Flag Decision
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <p>Waiting for redirection events...</p>
              <p className="text-xs text-gray-400">
                Trigger a surge to see data here.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredEvents.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
            <span>Showing {filteredEvents.length} decisions</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  trend,
  trendColor = "text-green-500",
  icon,
  primary = false,
}: {
  title: string;
  value: string | number;
  trend: string;
  trendColor?: string;
  icon: React.ReactNode;
  primary?: boolean;
}) => (
  <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="flex items-end gap-3">
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div
        className={`text-xs font-bold ${trendColor} mb-1 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700`}
      >
        {trend}
      </div>
    </div>
  </div>
);

const Badge = ({ type }: { type: string }) => {
  const styles =
    {
      safe: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
      conditional:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
      standard:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    }[type] || "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${type === "safe" ? "bg-green-500" : type === "conditional" ? "bg-amber-500" : "bg-blue-500"}`}
      ></span>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default RedirectionMonitor;
