import { PATIENT_FLOW_DATA } from "@/db/mockdata";
import { PatientFlowRecord } from "./types";

export const getPatientFlowData = async (): Promise<PatientFlowRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PATIENT_FLOW_DATA);
    }, 1000); // Simulate 1s delay
  });
};
