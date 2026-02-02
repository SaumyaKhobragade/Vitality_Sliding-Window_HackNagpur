import React from "react";

// Enums
export type Department = "NURSE" | "GENERAL" | "ICU";

// Patient Model
export interface Patient {
  id: string;
  displayId?: string; // Human-readable ID (e.g., "PT-00123")
  baseSeverity: number; // 1-10
  arrivalTime: number; // Timestamp (ms)
  targetHospitalId: string;
  distressScore: number; // AtomicInteger serializes to number
  treating: boolean; // Mapped from isTreating
  dynamicPriority: number; // Calculated field

  // Legacy fields (optional for compatibility during migration)
  severity?: number;
  waitTime?: string;
  status?: string;
  priorityScore?: number;
}

// Hospital Model
export interface Hospital {
  id: string;
  name: string;
  maxCapacity: number;
  // waitingRooms keys map to the Department enum
  waitingRooms: Record<Department, Patient[]>;
  // Note: departmentalStaff (ThreadPoolExecutor) is excluded as it doesn't serialize cleanly to useful JSON
  activeTreatments: number; // AtomicInteger serializes to number

  // Computed getters included in serialization
  totalQueueSize: number;
  activeDoctorCount: number;
}

// City Stats Model
export interface CityStats {
  totalHospitals: number;
  totalPatientsWaiting: number;
  totalDoctorsActive: number;
  surgeActive: boolean;
  recentRedirections: number; // Last 15 minutes
}

export interface Treatment {
  id: string;
  patientId: string;
  type: string;
  doctor: string;
  location: string;
  elapsed: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

export interface TreatmentRecord {
  id: string;
  patientId: string;
  hospitalId: string;
  type: string;
  doctorName: string;
  location: string;
  startedAt: string;
  progress: number;
  colorCode: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    color: string;
  };
  content: React.ReactNode;
}

export interface RedirectionDecision {
  id: string;
  patientId: string;
  fromHospital: string;
  fromHospitalName?: string;
  toHospital: string;
  toHospitalName?: string;
  decisionType: "safe" | "conditional" | "standard";
  reason: string;
  time: string;
  status: "completed" | "pending" | "failed";
  confidenceScore?: number;
  policyApplied?: string;
  constraints?: string[];
}

export interface PatientFlowRecord {
  timestamp: string;
  activePatients: number;
  waiting: number;
  discharged: number;
  newArrivals: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL" | "SUCCESS" | "SYSTEM";
  message: string;
}
// Auth Types
export interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Session {
  user: User;
  accessToken?: string;
}

// --- New Interfaces matching DB Schema ---

export interface DistressEvent {
  id: string;
  hospitalId: string;
  type: "COLLAPSE" | "AGITATION" | "SEIZURE" | "PROLONGED" | "OTHER";
  confidenceScore: number;
  severityScore: number;
  locationDetail?: string;
  cameraFeedId?: string;
  detectedAt: string; // ISO string
  status: "PENDING" | "CONFIRMED" | "DISMISSED" | "EXPIRED" | "resolved";
  queuePositionOriginal?: number;
  queuePositionNew?: number;
  recommendedAction?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  nurseId?: string;
  justificationNote?: string;
  priorityDelta?: number;
  expiresAt?: string;
}

export interface TriagePolicy {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isAlertMode: boolean;
  severityWeight: number;
  agingRateMinutes: number;
  enableAging: boolean;
  distressDecay: number;
  updatedAt: string;
  updatedBy?: string;
}
