import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Formats a patient ID for display
 * If displayId exists, use it. Otherwise, generate from UUID
 * @param id - The patient UUID
 * @param displayId - Optional display ID
 * @returns Formatted patient ID (e.g., "PT-00123")
 */
export function formatPatientId(id: string, displayId?: string): string {
  if (displayId) {
    return displayId;
  }
  // Generate a readable ID from the UUID
  // Take last 8 chars of UUID and convert to a number-based ID
  const hashCode = id.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const patientNum = Math.abs(hashCode) % 100000;
  return `PT-${patientNum.toString().padStart(5, "0")}`;
}

/**
 * Gets a short version of patient ID for compact displays
 * @param id - The patient UUID
 * @param displayId - Optional display ID
 * @returns Short patient ID (e.g., "PT-123")
 */
export function getShortPatientId(id: string, displayId?: string): string {
  if (displayId) {
    return displayId.replace(/^PT-0*/, "PT-");
  }
  return formatPatientId(id, displayId).replace(/^PT-0*/, "PT-");
}
