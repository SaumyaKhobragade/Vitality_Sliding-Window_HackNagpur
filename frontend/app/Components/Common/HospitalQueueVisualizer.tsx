"use client";

import React, { useState, useEffect } from "react";
import { useSimulation } from "../Context/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, User, ArrowRight, Clock } from "lucide-react";
import { formatPatientId, getShortPatientId } from "@/lib/utils";

const HospitalQueueVisualizer = () => {
  const { hospitals, activeTreatments } = useSimulation();

  return (
    <div className="space-y-8">
      {Object.values(hospitals).map((hospital) => (
        <HospitalBoard
          key={hospital.id}
          hospital={hospital}
          activeTreatments={activeTreatments[hospital.id] || []}
        />
      ))}
    </div>
  );
};

const HospitalBoard = ({
  hospital,
  activeTreatments,
}: {
  hospital: any;
  activeTreatments: any[];
}) => {
  const departments = ["NURSE", "GENERAL", "ICU"];

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            {hospital.id}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {hospital.name}
            </h3>
            <div className="text-xs text-gray-500 flex gap-2">
              <span>
                Pos: ({hospital.x}, {hospital.y})
              </span>
              <span>•</span>
              <span>Load: {hospital.totalQueueSize} patients</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {departments.map((dept) => (
          <QueueLane
            key={dept}
            title={`${dept} Waiting`}
            patients={hospital.waitingRooms?.[dept] || []}
            type="waiting"
          />
        ))}

        {/* Active Treatment Lane - Real Data or Fallback */}
        <TreatmentLane
          treatments={activeTreatments}
        />
      </div>
    </div>
  );
};

const QueueLane = ({
  title,
  patients,
  type,
}: {
  title: string;
  patients: any[];
  type: string;
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 min-h-[150px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">
          {patients.length}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {patients.slice(0, 8).map(
            (
              p: any, // Show max 8 to prevent overflow
            ) => (
              <PatientCard key={p.id} patient={p} />
            ),
          )}
          {patients.length > 8 && (
            <div className="text-center text-xs text-gray-400 py-2">
              + {patients.length - 8} more
            </div>
          )}
        </AnimatePresence>

        {patients.length === 0 && (
          <div className="h-20 flex items-center justify-center text-gray-400 text-sm italic">
            Empty
          </div>
        )}
      </div>
    </div>
  );
};

const TreatmentLane = ({ treatments }: { treatments: any[] }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 min-h-[150px] border border-green-100 dark:border-green-900/20">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-200 dark:border-green-800/30">
        <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
          Actively Treating
        </span>
        <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] px-1.5 py-0.5 rounded-full">
          {treatments.length}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {treatments.map((t) => (
            <motion.div
              key={t.patientId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-surface-dark p-2 rounded border border-green-200 dark:border-green-800 shadow-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-900 dark:text-white flex justify-between">
                  <span>{getShortPatientId(t.patientId)}</span>
                  <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {t.department} • {Math.round(t.duration / 1000)}s
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {treatments.length === 0 && (
          <div className="h-20 flex items-center justify-center text-green-800/40 text-sm italic">
            No Active Treatments
          </div>
        )}
      </div>
    </div>
  );
};

const PatientCard = ({ patient }: { patient: any }) => {
  const isPendingDistress = patient.distressStatus === "PENDING";
  const isConfirmedDistress = patient.distressStatus === "CONFIRMED";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: isPendingDistress
          ? "rgba(245, 158, 11, 0.1)"
          : isConfirmedDistress
            ? "rgba(239, 68, 68, 0.1)"
            : "transparent",
      }}
      exit={{ opacity: 0, x: -10 }}
      className={`p-2 rounded shadow-sm border ${
        isPendingDistress
          ? "border-amber-400 animate-pulse bg-amber-50 dark:bg-amber-900/10"
          : isConfirmedDistress
            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
            : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-700"
      } flex items-center gap-2`}
    >
      <div
        className={`w-1.5 h-8 rounded-full ${
          isConfirmedDistress || patient.baseSeverity >= 8
            ? "bg-red-500"
            : isPendingDistress || patient.baseSeverity >= 5
              ? "bg-orange-400"
              : "bg-blue-400"
        }`}
      ></div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate flex items-center gap-1">
            {getShortPatientId(patient.id, patient.displayId)}
            {isPendingDistress && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            )}
            {isConfirmedDistress && (
              <Activity className="w-3 h-3 text-red-500" />
            )}
          </span>
          <span className="text-[10px] text-gray-400">
            Sev: {patient.baseSeverity}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{(Date.now() - patient.arrivalTime) / 1000}s</span>
          </div>
          <span className="font-mono text-[9px] font-bold text-blue-500">
            P:{Math.round(patient.dynamicPriority)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default HospitalQueueVisualizer;
