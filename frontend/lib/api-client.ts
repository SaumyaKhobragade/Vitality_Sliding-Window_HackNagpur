import {
  CityStats,
  Hospital,
  Patient,
  Policy,
  RedirectionDecision,
  PatientFlowRecord,
  TreatmentRecord,
  TriagePolicy,
} from "./types";

const SIMULATION_API = "http://localhost:9090/api/simulation";

// Helper for Simulation API (Java Backend)
async function fetchSimulation<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${SIMULATION_API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Simulation API Error: ${response.status} ${response.statusText}`,
    );
  }

  // Handle text responses (like from /init) vs JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text() as unknown as T;
}

// Helper for Next.js API (Supabase)
async function fetchLocal<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(
      `Local API Error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

// --- Commands (Java Backend) ---

export const initCity = async (count: number): Promise<string> => {
  return fetchSimulation<string>("/init", {
    method: "POST",
    body: JSON.stringify({ count: count.toString() }),
  });
};

export const injectPatient = async (
  hospitalId: string,
  severity: number,
): Promise<string> => {
  return fetchSimulation<string>("/patient", {
    method: "POST",
    body: JSON.stringify({ hospitalId, severity }),
  });
};

export const triggerSurge = async (count: number): Promise<string> => {
  return fetchSimulation<string>("/surge", {
    method: "POST",
    body: JSON.stringify({ count: count.toString() }),
  });
};

export const syncPolicyToSimulation = async (
  key: string,
  value: number,
): Promise<string> => {
  return fetchSimulation<string>("/policy/sync", {
    method: "POST",
    body: JSON.stringify({ key, value }),
  });
};

export interface SimulationStats {
  totalHospitals: number;
  totalPatients: number;
  avgQueueLength: number;
  avgWaitTime: number;
  surgeActive: boolean;
}

export const getSimulationStats = async (): Promise<SimulationStats> => {
  return fetchSimulation<SimulationStats>("/stats", {
    method: "GET",
  });
};

export const triggerDistress = async (
  hospitalId: string,
  patientId: string,
  distressLevel: number,
): Promise<string> => {
  return fetchSimulation<string>("/distress", {
    method: "POST",
    body: JSON.stringify({ hospitalId, patientId, distressLevel }),
  });
};

export const evaluateRedirection = async (
  currentHospitalId: string,
  patientId: string,
): Promise<string> => {
  return fetchSimulation<string>("/redirect/evaluate", {
    method: "POST",
    body: JSON.stringify({ currentHospitalId, patientId }),
  });
};

// --- Queries (Supabase via Next.js API) ---

export const getCityStats = async (): Promise<CityStats> => {
  return fetchLocal<CityStats>("/api/stats");
};

export const getAnalytics = async (): Promise<PatientFlowRecord[]> => {
  return fetchLocal<PatientFlowRecord[]>("/api/analytics");
};

export const getHospital = async (id: string): Promise<Hospital> => {
  return fetchLocal<Hospital>(`/api/hospitals/${id}`);
};

export const getHospitals = async (): Promise<Hospital[]> => {
  return fetchLocal<Hospital[]>("/api/hospitals");
};

export const getRedirectionDecisions = async (): Promise<
  RedirectionDecision[]
> => {
  return fetchLocal<RedirectionDecision[]>("/api/alerts");
};

export const getDistressEvents = async (): Promise<any[]> => {
  return fetchLocal<any[]>("/api/distress");
};

export const updateDistressEvent = async (
  id: string,
  status: string,
  resolutionNotes?: string,
  resolvedBy?: string,
  clinicalNotes?: string,
  priorityDelta?: number,
): Promise<any> => {
  return fetchLocal<any>(`/api/distress/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      resolutionNotes,
      resolvedBy,
      clinicalNotes,
      priorityDelta,
    }),
  });
};

export const confirmDistressSimulation = async (
  patientId: string,
): Promise<string> => {
  return fetchSimulation<string>("/distress/confirm", {
    method: "POST",
    body: JSON.stringify({ patientId }),
  });
};

export const dismissDistressSimulation = async (
  patientId: string,
): Promise<string> => {
  return fetchSimulation<string>("/distress/dismiss", {
    method: "POST",
    body: JSON.stringify({ patientId }),
  });
};

export const getPatientQueue = async (
  hospitalId?: string,
): Promise<Patient[]> => {
  const query = hospitalId ? `?hospitalId=${hospitalId}` : "";
  return fetchLocal<Patient[]>(`/api/patients/queue${query}`);
};

export const getTreatments = async (
  hospitalId?: string,
): Promise<TreatmentRecord[]> => {
  const query = hospitalId ? `?hospitalId=${hospitalId}` : "";
  return fetchLocal<TreatmentRecord[]>(`/api/treatments${query}`);
};

export const getPolicies = async (): Promise<Policy[]> => {
  return fetchLocal<Policy[]>("/api/policies");
};

export const getTriagePolicies = async (): Promise<TriagePolicy[]> => {
  return fetchLocal<TriagePolicy[]>("/api/policies/triage");
};

export const updateTriagePolicy = async (
  key: string,
  value: string,
): Promise<TriagePolicy> => {
  return fetchLocal<TriagePolicy>("/api/policies/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
};

export const updatePolicy = async (
  policy: Partial<Policy> & { id: string },
): Promise<Policy> => {
  return fetchLocal<Policy>("/api/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(policy),
  });
};

export const getSimulationHistory = async (): Promise<any[]> => {
  return fetchLocal<any[]>("/api/simulation/history");
};
