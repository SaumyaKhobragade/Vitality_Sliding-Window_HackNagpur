/**
 * Supabase Client-Side Persistence for Simulation
 * Handles persisting simulation data to Supabase from the frontend
 */

import { createClient } from "@/supabase/client";
import { Hospital, Patient, CityStats, LogEntry } from "./types";
import { SimulationEvent } from "./simulation-engine";
import { formatPatientId, getShortPatientId } from "./utils";

const supabase = createClient();

// --- Batch Insert Helpers (for performance) ---
let logBuffer: { level: string; message: string }[] = [];
let logFlushTimeout: NodeJS.Timeout | null = null;

async function flushLogBuffer() {
  if (logBuffer.length === 0) return;

  const logsToInsert = [...logBuffer];
  logBuffer = [];

  try {
    const { error } = await supabase
      .from("simulation_logs")
      .insert(logsToInsert);
    if (error) console.error("Error flushing logs:", error.message);
  } catch (err) {
    console.error("Failed to flush log buffer:", err);
  }
}

// --- Hospital Persistence ---

export async function persistHospitals(hospitals: Hospital[]): Promise<void> {
  try {
    // Upsert hospitals to avoid duplicates
    const hospitalData = hospitals.map((h) => ({
      id: h.id,
      name: h.name,
      max_capacity: h.maxCapacity,
      current_status:
        h.totalQueueSize > h.maxCapacity * 0.8 ? "busy" : "normal",
      active_treatments_count: h.activeTreatments,
      active_doctor_count: h.activeDoctorCount,
      total_queue_size: h.totalQueueSize,
      specialties: ["NURSE", "GENERAL", "ICU"],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("hospitals")
      .upsert(hospitalData, { onConflict: "id" });

    if (error) {
      console.error("Error persisting hospitals:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist hospitals:", err);
  }
}

// --- Patient Persistence ---

export async function persistPatient(
  patient: Patient,
  hospitalId: string,
  status: string = "Waiting",
): Promise<void> {
  try {
    const patientData = {
      id: patient.id,
      display_id: formatPatientId(patient.id),
      hospital_id: hospitalId,
      target_hospital_id: patient.targetHospitalId,
      base_severity: patient.baseSeverity,
      priority_score: patient.dynamicPriority,
      distress_score: patient.distressScore,
      status: status,
      arrival_time: new Date(patient.arrivalTime).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("patients")
      .upsert(patientData, { onConflict: "id" });

    if (error) {
      console.error("Error persisting patient:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist patient:", err);
  }
}

export async function updatePatientStatus(
  patientId: string,
  status: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("patients")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", patientId);

    if (error) {
      console.error("Error updating patient status:", error.message);
    }
  } catch (err) {
    console.error("Failed to update patient status:", err);
  }
}

// --- Distress Event Persistence ---

export async function persistDistressEvent(
  event: SimulationEvent,
): Promise<void> {
  if (event.type !== "DISTRESS_DETECTED") return;

  try {
    const distressData = {
      hospital_id: event.data.hospitalId,
      type: "OTHER" as const,
      confidence_score: Math.floor(Math.random() * 30) + 70, // 70-100
      severity_score: event.data.newPriority,
      location_detail: `Waiting Area`,
      detected_at: new Date(event.timestamp).toISOString(),
      status: "active",
      queue_position_original: event.data.oldPriority,
      queue_position_new: event.data.newPriority,
      recommended_action: "Immediate triage re-evaluation",
    };

    const { error } = await supabase
      .from("distress_events")
      .insert(distressData);

    if (error) {
      console.error("Error persisting distress event:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist distress event:", err);
  }
}

// --- Redirection Decision Persistence ---

export async function persistRedirectionDecision(
  event: SimulationEvent,
): Promise<void> {
  if (event.type !== "REDIRECTION") return;

  try {
    const redirectionData = {
      patient_id: event.data.patientId,
      from_hospital_id: event.data.fromHospitalId,
      to_hospital_id: event.data.toHospitalId,
      decision_type: "standard" as const,
      reason: event.data.reason || "Capacity balancing",
      status: "completed",
      confidence_score: 85,
      policy_applied: "ADAPTIVE",
      constraints: ["Capacity < 80%"],
      created_at: new Date(event.timestamp).toISOString(),
    };

    const { error } = await supabase
      .from("redirection_decisions")
      .insert(redirectionData);

    if (error) {
      console.error("Error persisting redirection:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist redirection:", err);
  }
}

// --- Simulation Log Persistence (Buffered) ---

export function persistSimulationLog(level: string, message: string): void {
  logBuffer.push({ level, message });

  // Flush every 2 seconds or when buffer hits 20 entries
  if (logBuffer.length >= 20) {
    flushLogBuffer();
  } else if (!logFlushTimeout) {
    logFlushTimeout = setTimeout(() => {
      flushLogBuffer();
      logFlushTimeout = null;
    }, 2000);
  }
}

export async function forceFlushLogs(): Promise<void> {
  if (logFlushTimeout) {
    clearTimeout(logFlushTimeout);
    logFlushTimeout = null;
  }
  await flushLogBuffer();
}

// --- Analytics Snapshot Persistence ---

export async function persistAnalyticsSnapshot(
  stats: CityStats,
): Promise<void> {
  try {
    const snapshotData = {
      hospital_id: null, // City-wide
      total_patients_waiting: stats.totalPatientsWaiting,
      total_doctors_active: stats.totalDoctorsActive,
      total_treatments_active: 0,
      average_wait_time_minutes:
        stats.totalDoctorsActive > 0
          ? (stats.totalPatientsWaiting / stats.totalDoctorsActive) * 5
          : 0,
      surge_active: stats.surgeActive,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("analytics_snapshots")
      .insert(snapshotData);

    if (error) {
      console.error("Error persisting analytics snapshot:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist analytics snapshot:", err);
  }
}

// --- Load Historical Data ---

export async function loadHistoricalLogs(
  limit: number = 50,
): Promise<LogEntry[]> {
  try {
    const { data, error } = await supabase
      .from("simulation_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error loading logs:", error.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      timestamp: new Date(row.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      level: row.level as LogEntry["level"],
      message: row.message,
    }));
  } catch (err) {
    console.error("Failed to load logs:", err);
    return [];
  }
}

export async function loadHistoricalStats(): Promise<CityStats | null> {
  try {
    const { data, error } = await supabase
      .from("analytics_snapshots")
      .select("*")
      .is("hospital_id", null)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      totalHospitals: 0, // Will be set from live data
      totalPatientsWaiting: data.total_patients_waiting,
      totalDoctorsActive: data.total_doctors_active,
      surgeActive: data.surge_active,
      recentRedirections: 0,
    };
  } catch (err) {
    console.error("Failed to load stats:", err);
    return null;
  }
}

// --- Clear Simulation Data (for reset) ---

export async function clearSimulationData(): Promise<void> {
  try {
    // Delete in order of dependencies
    await supabase
      .from("redirection_decisions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("distress_events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("treatments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("patients")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("analytics_snapshots")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("simulation_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    // Keep hospitals for reference, but reset their stats
    await supabase
      .from("hospitals")
      .update({
        active_treatments_count: 0,
        active_doctor_count: 10,
        total_queue_size: 0,
        current_status: "normal",
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Simulation data cleared from Supabase");
  } catch (err) {
    console.error("Failed to clear simulation data:", err);
  }
}

// --- Event Handler for Simulation Engine ---

export async function handleSimulationEventPersistence(
  event: SimulationEvent,
): Promise<void> {
  switch (event.type) {
    case "PATIENT_ADMITTED":
      // Persist patient (without await to not block)
      persistPatient(
        {
          id: event.data.patientId,
          baseSeverity: event.data.severity || 5,
          arrivalTime: event.timestamp,
          targetHospitalId: event.data.hospitalId,
          distressScore: 0,
          treating: false,
          dynamicPriority: event.data.severity || 5,
        } as Patient,
        event.data.hospitalId,
        "Waiting",
      );
      persistSimulationLog(
        "SUCCESS",
        `${getShortPatientId(event.data.patientId)} admitted to ${event.data.hospitalName}`,
      );
      break;

    case "PATIENT_DISCHARGED":
      updatePatientStatus(event.data.patientId, "Discharged");
      persistSimulationLog(
        "INFO",
        `${getShortPatientId(event.data.patientId)} discharged from ${event.data.hospitalName}`,
      );
      break;

    case "DISTRESS_DETECTED":
      persistDistressEvent(event);
      persistSimulationLog(
        "CRITICAL",
        `DISTRESS: ${getShortPatientId(event.data.patientId)} escalated to priority ${event.data.newPriority}`,
      );
      break;

    case "REDIRECTION":
      persistRedirectionDecision(event);
      updatePatientStatus(event.data.patientId, "Redirected");
      persistSimulationLog(
        "WARN",
        `${getShortPatientId(event.data.patientId)} redirected: ${event.data.fromHospital} → ${event.data.toHospital}`,
      );
      break;

    case "SURGE_TRIGGERED":
      persistSimulationLog(
        "WARN",
        `SURGE: ${event.data.count} patients injected`,
      );
      break;

    case "STAFF_DROPOUT":
      persistSimulationLog(
        "WARN",
        `Staff dropout: ${event.data.percent}% reduction`,
      );
      break;
  }
}

// --- Periodic State Sync ---

let syncInterval: NodeJS.Timeout | null = null;

export function startPeriodicSync(
  getHospitals: () => Hospital[],
  getStats: () => CityStats,
  intervalMs: number = 10000,
): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  syncInterval = setInterval(async () => {
    const hospitals = getHospitals();
    const stats = getStats();

    if (hospitals.length > 0) {
      await persistHospitals(hospitals);
      await persistAnalyticsSnapshot(stats);
    }
  }, intervalMs);
}

export function stopPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  forceFlushLogs();
}
