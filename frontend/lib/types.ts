import React from "react";

// Enums
export type Department = 'NURSE' | 'GENERAL' | 'ICU';

// Patient Model
export interface Patient {
  id: string;
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
  toHospital: string;
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

