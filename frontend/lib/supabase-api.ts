import { createClient } from "@/supabase/server";
import {
  Hospital,
  Patient,
  CityStats,
  PatientFlowRecord,
  RedirectionDecision,
  Department,
  DistressEvent,
  Policy,
  TreatmentRecord,
  LogEntry,
} from "./types";

// --- Mappers ---
// ... existing mappers ...

function mapTreatmentRecord(row: any): TreatmentRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    hospitalId: row.hospital_id,
    type: row.type,
    doctorName: row.doctor_name,
    location: row.location,
    startedAt: row.started_at,
    progress: row.progress,
    colorCode: row.color_code,
  };
}

// --- Data Access Functions ---
// ... existing functions ...

export async function getTreatments(
  hospitalId?: string,
): Promise<TreatmentRecord[]> {
  const supabase = await createClient();
  let query = supabase.from("treatments").select("*");
  if (hospitalId) {
    query = query.eq("hospital_id", hospitalId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching treatments:", error);
    throw new Error(error.message);
  }

  return data.map(mapTreatmentRecord);
}

function mapHospital(row: any): Hospital {
  // Map string array specialties to waitingRooms keys with empty patient lists
  // strictly to satisfy the interface if we don't fetch all patients eagerly.
  const waitingRooms: Record<string, Patient[]> = {};
  if (Array.isArray(row.specialties)) {
    row.specialties.forEach((dept: string) => {
      waitingRooms[dept] = [];
    });
  }

  return {
    id: row.id,
    name: row.name,
    maxCapacity: row.max_capacity || 0,
    waitingRooms: waitingRooms as Record<Department, Patient[]>,
    activeTreatments: row.active_treatments_count || 0,
    totalQueueSize: row.total_queue_size || 0,
    activeDoctorCount: row.active_doctor_count || 0,
  };
}

function mapPatient(row: any): Patient {
  return {
    id: row.id,
    baseSeverity: row.base_severity || 1,
    arrivalTime: new Date(row.arrival_time).getTime(),
    targetHospitalId: row.target_hospital_id,
    distressScore: row.distress_score || 0,
    treating: row.status === "Treating",
    dynamicPriority: row.priority_score || 0,
    status: row.status,
    severity: row.base_severity, // Legacy mapping
    waitTime: "0m", // Needs calculation if not in DB
    priorityScore: row.priority_score, // Legacy mapping
  };
}

function mapRedirectionDecision(row: any): RedirectionDecision {
  return {
    id: row.id,
    patientId: row.patient?.display_id || row.patient_id,
    fromHospital: row.from_hospital?.id || row.from_hospital_id,
    fromHospitalName: row.from_hospital?.name,
    toHospital: row.to_hospital?.id || row.to_hospital_id,
    toHospitalName: row.to_hospital?.name,
    decisionType: row.decision_type as "safe" | "conditional" | "standard",
    reason: row.reason,
    time: row.created_at,
    status: row.status as "completed" | "pending" | "failed",
    confidenceScore: row.confidence_score,
    policyApplied: row.policy_applied,
    constraints: row.constraints,
  };
}

function mapDistressEvent(row: any): DistressEvent {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    type: row.type,
    confidenceScore: row.confidence_score,
    severityScore: row.severity_score,
    locationDetail: row.location_detail,
    cameraFeedId: row.camera_feed_id,
    detectedAt: row.detected_at,
    status: row.status,
    queuePositionOriginal: row.queue_position_original,
    queuePositionNew: row.queue_position_new,
    recommendedAction: row.recommended_action,
    resolutionNotes: row.resolution_notes,
    resolvedBy: row.resolved_by,
  };
}

function mapPolicy(row: any): Policy {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    isAlertMode: row.is_alert_mode,
    severityWeight: row.severity_weight,
    agingRateMinutes: row.aging_rate_minutes,
    enableAging: row.enable_aging,
    distressDecay: row.distress_decay,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

// --- Data Access Functions ---

export async function getHospitals(): Promise<Hospital[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("hospitals").select("*");

  if (error) {
    console.error("Error fetching hospitals:", error);
    throw new Error(error.message);
  }

  return data.map(mapHospital);
}

export async function getHospitalById(id: string): Promise<Hospital | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching hospital ${id}:`, error);
    return null;
  }

  return mapHospital(data);
}

export async function getPatients(hospitalId?: string): Promise<Patient[]> {
  const supabase = await createClient();
  let query = supabase.from("patients").select("*");

  if (hospitalId) {
    query = query.eq("hospital_id", hospitalId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching patients:", error);
    throw new Error(error.message);
  }

  return data.map(mapPatient);
}

export async function getRedirectionDecisions(): Promise<
  RedirectionDecision[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("redirection_decisions")
    .select(
      `
      *,
      patient:patients!patient_id(display_id),
      from_hospital:hospitals!from_hospital_id(id, name),
      to_hospital:hospitals!to_hospital_id(id, name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching redirection decisions:", error);
    throw new Error(error.message);
  }

  return data.map(mapRedirectionDecision);
}

export async function getCityStats(): Promise<CityStats> {
  const supabase = await createClient();

  // fetch recent redirections count (last 15 mins)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: redirectionCount } = await supabase
    .from("redirection_decisions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", fifteenMinutesAgo);

  // This assumes specific aggregations or a single stats row.
  // Since we don't have a 'city_stats' table in schema.sql that maps 1:1,
  // we might need to query 'analytics_snapshots' or aggregate 'hospitals' and 'patients'.
  // For now, let's aggregate from hospitals/patients to be safe, or check analytics_snapshots.
  // 'analytics_snapshots' has hospital_id=NULL for city-wide.

  const { data, error } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .is("hospital_id", null)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Fallback: Calculate from live tables if snapshot missing
    // This is expensive but safe for fallback
    const hospitals = await getHospitals();
    const totalHospitals = hospitals.length;
    const totalPatientsWaiting = hospitals.reduce(
      (acc, h) => acc + h.totalQueueSize,
      0,
    );
    const totalDoctorsActive = hospitals.reduce(
      (acc, h) => acc + h.activeDoctorCount,
      0,
    );

    return {
      totalHospitals,
      totalPatientsWaiting,
      totalDoctorsActive,
      surgeActive: false, // Default
      recentRedirections: redirectionCount || 0,
    };
  }

  return {
    totalHospitals: 0, // Snapshot might not store this, check schema
    totalPatientsWaiting: data.total_patients_waiting,
    totalDoctorsActive: data.total_doctors_active,
    surgeActive: data.surge_active,
    recentRedirections: redirectionCount || 0,
  };
}

export async function getAnalyticsSnapshots(): Promise<PatientFlowRecord[]> {
  const supabase = await createClient();
  // Fetch last 12 snapshots (e.g., last hour if 5m intervals) for city-wide (hospital_id is null)
  const { data, error } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .is("hospital_id", null)
    .order("timestamp", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }

  return data.map((row: any) => ({
    timestamp: new Date(row.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    activePatients: row.total_treatments_active || 0,
    waiting: row.total_patients_waiting || 0,
    discharged: 0, // Not in snapshot schema currently
    newArrivals: 0, // Not in snapshot schema currently
  }));
}

export async function getDistressEvents(): Promise<DistressEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("distress_events")
    .select("*")
    .order("detected_at", { ascending: false });

  if (error) {
    console.error("Error fetching distress events:", error);
    throw new Error(error.message);
  }

  return data.map(mapDistressEvent);
}

export async function getPolicies(): Promise<Policy[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching policies:", error);
    throw new Error(error.message);
  }

  return data.map(mapPolicy);
}

export async function updatePolicy(
  id: string,
  updates: Partial<Policy>,
): Promise<Policy | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("policies")
    .update({
      severity_weight: updates.severityWeight,
      aging_rate_minutes: updates.agingRateMinutes,
      enable_aging: updates.enableAging,
      distress_decay: updates.distressDecay,
      is_active: updates.isActive,
      is_alert_mode: updates.isAlertMode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating policy:", error);
    return null;
  }

  return mapPolicy(data);
}

export async function createSimulationLog(
  level: string,
  message: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("simulation_logs")
    .insert({ level, message });

  if (error) {
    console.error("Error creating simulation log:", error);
  }
}

export async function getSimulationLogs(): Promise<LogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simulation_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching simulation logs:", error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    timestamp: new Date(row.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
    }),
    level: row.level,
    message: row.message,
  }));
}

export async function updateDistressEventStatus(
  id: string,
  status: string,
  resolutionNotes?: string,
  resolvedBy?: string,
): Promise<DistressEvent | null> {
  const supabase = await createClient();

  const updateData: any = {
    status: status.toLowerCase(),
    resolution_notes: resolutionNotes,
  };

  if (resolvedBy) {
    updateData.resolved_by = resolvedBy;
  }

  const { data, error } = await supabase
    .from("distress_events")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating distress event:", error);
    return null;
  }

  return mapDistressEvent(data);
}
