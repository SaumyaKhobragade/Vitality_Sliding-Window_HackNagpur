import { CityStats, Hospital } from "./types";

const BASE_URL = "http://localhost:9090/api/simulation";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle text responses (like from /init) vs JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
      return response.json();
  }
  return response.text() as unknown as T;
}

export const initCity = async (count: number): Promise<string> => {
  return fetchJson<string>("/init", {
    method: "POST",
    body: JSON.stringify({ count: count.toString() }),
  });
};

export const injectPatient = async (hospitalId: string, severity: number): Promise<string> => {
  return fetchJson<string>("/patient", {
    method: "POST",
    body: JSON.stringify({ hospitalId, severity }),
  });
};

export const triggerSurge = async (count: number): Promise<string> => {
  return fetchJson<string>("/surge", {
    method: "POST",
    body: JSON.stringify({ count: count.toString() }),
  });
};

export const triggerDistress = async (hospitalId: string, patientId: string, distressLevel: number): Promise<string> => {
  return fetchJson<string>("/distress", {
    method: "POST",
    body: JSON.stringify({ hospitalId, patientId, distressLevel }),
  });
};

export const evaluateRedirection = async (currentHospitalId: string, patientId: string): Promise<string> => {
  return fetchJson<string>("/redirect/evaluate", {
    method: "POST",
    body: JSON.stringify({ currentHospitalId, patientId }),
  });
};

export const getCityStats = async (): Promise<CityStats> => {
  return fetchJson<CityStats>("/stats");
};

export const getHospital = async (id: string): Promise<Hospital> => {
  return fetchJson<Hospital>(`/hospital/${id}`);
};
