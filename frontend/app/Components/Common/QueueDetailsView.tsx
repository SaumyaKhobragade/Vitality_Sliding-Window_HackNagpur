"use client";

import React, { useState, useEffect } from "react";
import { useSimulation } from "../Context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import * as ApiClient from "@/lib/api-client";
import { formatPatientId } from "@/lib/utils";
import {
  Clock,
  Users,
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";

const QueueDetailsView = () => {
  const { hospitals, activeTreatments } = useSimulation();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("waitTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Select first hospital by default
  useEffect(() => {
    if (!selectedHospitalId && Object.keys(hospitals).length > 0) {
      setSelectedHospitalId(Object.keys(hospitals)[0]);
    }
  }, [hospitals, selectedHospitalId]);

  // Hospitals are managed by SimulationContext, no need for additional fetching here

  const hospital = hospitals[selectedHospitalId];
  const treatments = activeTreatments[selectedHospitalId] || [];

  if (!hospital) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">No hospital data available</p>
          <p className="text-xs text-gray-400">
            {Object.keys(hospitals).length === 0
              ? "Waiting for hospital data from backend..."
              : `Found ${Object.keys(hospitals).length} hospitals but none selected`}
          </p>
        </div>
      </div>
    );
  }

  // Aggregate all waiting patients from all departments
  const allWaitingPatients = Object.entries(
    hospital.waitingRooms || {},
  ).flatMap(([dept, patients]: [string, any]) =>
    (patients || []).map((p: any) => ({
      ...p,
      department: dept,
      waitTime: Date.now() - (p.arrivalTime || Date.now()),
      distressStatus: p.distressStatus,
    })),
  );

  // Filter and sort patients
  const filteredPatients = allWaitingPatients
    .filter((p) => p.id?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "waitTime") {
        aVal = a.waitTime;
        bVal = b.waitTime;
      } else if (sortField === "severity") {
        aVal = a.baseSeverity || 0;
        bVal = b.baseSeverity || 0;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

  const queueCapacity = hospital.totalQueueSize || 0;
  const maxCapacity = 50; // Could be from hospital config
  const capacityPercent = (queueCapacity / maxCapacity) * 100;
  const oldestWaitTime =
    allWaitingPatients.length > 0
      ? Math.max(...allWaitingPatients.map((p) => p.waitTime))
      : 0;

  const activeDoctors = hospital.activeDoctorCount || 0;
  const totalDoctors = 10; // Default total doctors per hospital
  const inactiveDoctors = totalDoctors - activeDoctors;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hospital Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {hospital.name}
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold rounded-full">
              SURGE
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time operational view • Last updated: 1 min ago
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Adaptive
          </button>
          <button className="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            View Reports
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Queue Capacity */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Queue Capacity
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                capacityPercent >= 80
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : capacityPercent >= 50
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {capacityPercent >= 80
                ? "High Load"
                : capacityPercent >= 50
                  ? "Moderate"
                  : "Normal"}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {queueCapacity}
            </span>
            <span className="text-2xl text-gray-400 dark:text-gray-500 mb-1">
              /{maxCapacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                capacityPercent >= 80
                  ? "bg-red-500"
                  : capacityPercent >= 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              Oldest wait:{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {Math.floor(oldestWaitTime / 60000)} mins
              </span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Current load is 90% of maximum safe capacity.
          </p>
        </div>

        {/* Staff Availability */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Staff Availability
            </h3>
            <button className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
              Manage Roster
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeDoctors}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                Active
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <UserX className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {inactiveDoctors}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                Inactive
              </div>
            </div>
          </div>
          {inactiveDoctors > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <span className="font-semibold">Fatigue Warning:</span>{" "}
                {inactiveDoctors} doctor(s) inactive due to shift limits.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Waiting Patients Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Waiting Patients
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    Patient ID
                    {sortField === "id" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-2">
                    Severity (1-10)
                    {sortField === "severity" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("waitTime")}
                >
                  <div className="flex items-center gap-2">
                    Wait Time
                    {sortField === "waitTime" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredPatients.slice(0, 10).map((patient, index) => {
                  const isPending = patient.distressStatus === "PENDING";
                  const isConfirmed = patient.distressStatus === "CONFIRMED";

                  return (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        backgroundColor: isPending
                          ? "rgba(245, 158, 11, 0.05)"
                          : isConfirmed
                            ? "rgba(239, 68, 68, 0.05)"
                            : "transparent",
                      }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.02 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                        isPending ? "border-l-2 border-l-amber-500" : isConfirmed ? "border-l-2 border-l-red-500" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {formatPatientId(patient.id, patient.displayId)}
                        {isPending && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                            title="Distress Pending Confirmation"
                          />
                        )}
                        {isConfirmed && (
                          <Activity className="w-3 h-3 text-red-500" aria-label="Distress Confirmed" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={patient.baseSeverity || 1} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {Math.floor(patient.waitTime / 60000)} min
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={patient.department} />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(patient.dynamicPriority)}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No waiting patients</p>
            </div>
          )}
        </div>

        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing 1-{Math.min(10, filteredPatients.length)} of{" "}
              {filteredPatients.length}
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                Prev
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Page 1 of 1
              </button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Treatments */}
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Active Treatments
          </h3>
          <span className="text-sm text-gray-500">Updates live</span>
        </div>
        <div className="space-y-4">
          <AnimatePresence>
            {treatments.length > 0 ? (
              treatments.map((treatment, index) => (
                <TreatmentProgressBar
                  key={treatment.patientId}
                  treatment={treatment}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active treatments</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: number }) => {
  const getColor = () => {
    if (severity >= 8)
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/30";
    if (severity >= 5)
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/30";
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/30";
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getColor()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${severity >= 8 ? "bg-red-500" : severity >= 5 ? "bg-yellow-500" : "bg-blue-500"}`}
      />
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    NURSE:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    GENERAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ICU: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}
    >
      {status || "Stable"}
    </span>
  );
};

const TreatmentProgressBar = ({
  treatment,
  index,
}: {
  treatment: any;
  index: number;
}) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const startTime = treatment.startTime || Date.now();
    const duration = treatment.duration || 10000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      const remaining = Math.max(duration - elapsed, 0);

      setProgress(newProgress);
      setTimeRemaining(remaining);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [treatment]);

  const departmentColors: Record<string, string> = {
    NURSE: "bg-purple-500",
    GENERAL: "bg-blue-500",
    ICU: "bg-teal-500",
  };

  const bgColor = departmentColors[treatment.department] || "bg-purple-500";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${bgColor}`} />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            Patient {formatPatientId(treatment.patientId, undefined)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {treatment.department || "General Ward"}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {Math.floor(timeRemaining / 1000)}s elapsed
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {treatment.department === "ICU"
            ? "Critical Care"
            : treatment.department === "NURSE"
              ? "Nursing"
              : "Standard Treatment"}
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {progress.toFixed(0)}% complete
        </span>
      </div>
    </motion.div>
  );
};

export default QueueDetailsView;
