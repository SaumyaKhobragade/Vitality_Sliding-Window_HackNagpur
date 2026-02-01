import { PatientFlowRecord } from "./types";

export const getPatientFlowData = async (): Promise<PatientFlowRecord[]> => {
  try {
    // If running server-side (e.g. during build or server component), use absolute URL or mock
    if (typeof window === 'undefined') {
       return [];
    }
    
    const res = await fetch("/api/analytics");
    if (!res.ok) {
        throw new Error("Failed to fetch analytics");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching patient flow data:", error);
    return [];
  }
};