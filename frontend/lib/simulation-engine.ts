/**
 * Frontend-Only Simulation Engine
 * Simulates hospital operations, patient flow, and chaos scenarios
 */

import {
  Hospital,
  Patient,
  CityStats,
  Department,
  LogEntry,
  RedirectionDecision,
} from "./types";

// --- Types ---
export interface SimulationState {
  hospitals: Hospital[];
  stats: CityStats;
  isRunning: boolean;
  tickCount: number;
  eventLog: SimulationEvent[];
}

export interface SimulationEvent {
  id: string;
  type:
    | "SURGE_TRIGGERED"
    | "DISTRESS_DETECTED"
    | "PATIENT_ADMITTED"
    | "PATIENT_DISCHARGED"
    | "REDIRECTION"
    | "STAFF_DROPOUT"
    | "SURGE_DETECTED"
    | "SURGE_ENDED";
  timestamp: number;
  data: Record<string, any>;
}

export interface SimulationConfig {
  patientSurgeMultiplier: number;
  staffDropoutPercent: number;
  distressFrequency: "LOW" | "MED" | "HIGH";
  policyLogic: string;
}

// --- Constants ---
const HOSPITAL_NAMES = [
  "City Central Hospital",
  "Memorial Medical Center",
  "St. Mary's Hospital",
  "General Hospital",
  "University Medical",
  "Community Health",
  "Regional Medical Center",
  "Sacred Heart Hospital",
  "Mount Sinai Medical",
  "Grace Medical Center",
];

const DISTRESS_CHANCE: Record<"LOW" | "MED" | "HIGH", number> = {
  LOW: 0.02,
  MED: 0.08,
  HIGH: 0.2,
};

// --- Utility Functions ---
// Generate UUID v4 compatible with Supabase
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const generateId = () => generateUUID();

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// --- Hospital Generator ---
function createHospital(index: number): Hospital {
  const id = generateUUID(); // Use UUID for hospitals too
  const maxCapacity = randomInt(50, 150);

  return {
    id,
    name: HOSPITAL_NAMES[index] || `Hospital ${index + 1}`,
    maxCapacity,
    waitingRooms: {
      NURSE: [],
      GENERAL: [],
      ICU: [],
    },
    activeTreatments: 0,
    totalQueueSize: 0,
    activeDoctorCount: randomInt(5, 15),
  };
}

// --- Patient Generator ---
function createPatient(targetHospitalId: string): Patient {
  const baseSeverity = randomInt(1, 10);
  return {
    id: generateUUID(), // Use proper UUID for Supabase
    baseSeverity,
    arrivalTime: Date.now(),
    targetHospitalId,
    distressScore: 0,
    treating: false,
    dynamicPriority: baseSeverity,
    severity: baseSeverity,
    waitTime: "0m",
    status: "waiting",
    priorityScore: baseSeverity,
  };
}

// --- Main Simulation Engine Class ---
export class SimulationEngine {
  private state: SimulationState;
  private config: SimulationConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private onEvent: (event: SimulationEvent) => void;
  private onStateChange: (state: SimulationState) => void;
  private tickRate: number = 1000; // 1 second per tick

  constructor(
    onEvent: (event: SimulationEvent) => void,
    onStateChange: (state: SimulationState) => void,
  ) {
    this.onEvent = onEvent;
    this.onStateChange = onStateChange;
    this.config = {
      patientSurgeMultiplier: 1.0,
      staffDropoutPercent: 0,
      distressFrequency: "LOW",
      policyLogic: "standard",
    };
    this.state = this.createInitialState(0);
  }

  private createInitialState(hospitalCount: number): SimulationState {
    const hospitals: Hospital[] = [];
    for (let i = 0; i < hospitalCount; i++) {
      hospitals.push(createHospital(i));
    }

    return {
      hospitals,
      stats: this.calculateStats(hospitals),
      isRunning: false,
      tickCount: 0,
      eventLog: [],
    };
  }

  private calculateStats(hospitals: Hospital[]): CityStats {
    let totalPatientsWaiting = 0;
    let totalDoctorsActive = 0;

    hospitals.forEach((h) => {
      totalPatientsWaiting += h.totalQueueSize;
      totalDoctorsActive += h.activeDoctorCount;
    });

    return {
      totalHospitals: hospitals.length,
      totalPatientsWaiting,
      totalDoctorsActive,
      surgeActive: this.config.patientSurgeMultiplier > 2,
      recentRedirections:
        this.state?.eventLog.filter(
          (e) =>
            e.type === "REDIRECTION" &&
            Date.now() - e.timestamp < 15 * 60 * 1000,
        ).length || 0,
    };
  }

  private emitEvent(event: SimulationEvent) {
    this.state.eventLog.push(event);
    // Keep only last 200 events
    if (this.state.eventLog.length > 200) {
      this.state.eventLog = this.state.eventLog.slice(-200);
    }
    this.onEvent(event);
  }

  // --- Public API ---

  init(hospitalCount: number): void {
    this.state = this.createInitialState(hospitalCount);
    this.onStateChange(this.state);
  }

  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), this.tickRate);
    this.onStateChange(this.state);
  }

  pause(): void {
    this.state.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onStateChange(this.state);
  }

  reset(): void {
    this.pause();
    this.state = this.createInitialState(0);
    this.config = {
      patientSurgeMultiplier: 1.0,
      staffDropoutPercent: 0,
      distressFrequency: "LOW",
      policyLogic: "standard",
    };
    this.onStateChange(this.state);
  }

  updateConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getState(): SimulationState {
    return this.state;
  }

  getConfig(): SimulationConfig {
    return this.config;
  }

  // Trigger a patient surge
  triggerSurge(count: number): void {
    if (this.state.hospitals.length === 0) return;

    for (let i = 0; i < count; i++) {
      const hospital = randomChoice(this.state.hospitals);
      const patient = createPatient(hospital.id);
      const dept: Department = randomChoice(["NURSE", "GENERAL", "ICU"]);

      hospital.waitingRooms[dept].push(patient);
      hospital.totalQueueSize++;

      this.emitEvent({
        id: generateId(),
        type: "PATIENT_ADMITTED",
        timestamp: Date.now(),
        data: {
          patientId: patient.id,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          department: dept,
          severity: patient.baseSeverity,
        },
      });
    }

    this.emitEvent({
      id: generateId(),
      type: "SURGE_TRIGGERED",
      timestamp: Date.now(),
      data: { count },
    });

    this.state.stats = this.calculateStats(this.state.hospitals);
    this.onStateChange(this.state);
  }

  // Trigger staff dropout
  triggerStaffDropout(percent: number): void {
    this.state.hospitals.forEach((hospital) => {
      const dropCount = Math.floor(
        hospital.activeDoctorCount * (percent / 100),
      );
      hospital.activeDoctorCount = Math.max(
        1,
        hospital.activeDoctorCount - dropCount,
      );
    });

    this.emitEvent({
      id: generateId(),
      type: "STAFF_DROPOUT",
      timestamp: Date.now(),
      data: { percent },
    });

    this.state.stats = this.calculateStats(this.state.hospitals);
    this.onStateChange(this.state);
  }

  // --- Simulation Tick ---
  private tick(): void {
    this.state.tickCount++;

    // 1. Natural patient arrivals based on surge multiplier
    const baseArrivals = Math.floor(this.config.patientSurgeMultiplier);
    const extraArrival =
      Math.random() < this.config.patientSurgeMultiplier % 1 ? 1 : 0;
    const totalArrivals = baseArrivals + extraArrival;

    for (let i = 0; i < totalArrivals; i++) {
      if (this.state.hospitals.length > 0) {
        const hospital = randomChoice(this.state.hospitals);
        const patient = createPatient(hospital.id);
        const dept: Department = randomChoice(["NURSE", "GENERAL", "ICU"]);

        hospital.waitingRooms[dept].push(patient);
        hospital.totalQueueSize++;

        this.emitEvent({
          id: generateId(),
          type: "PATIENT_ADMITTED",
          timestamp: Date.now(),
          data: {
            patientId: patient.id,
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            department: dept,
          },
        });
      }
    }

    // 2. Process treatments and discharge patients
    this.state.hospitals.forEach((hospital) => {
      const processRate = Math.max(
        1,
        Math.floor(hospital.activeDoctorCount / 3),
      );

      (["NURSE", "GENERAL", "ICU"] as Department[]).forEach((dept) => {
        const queue = hospital.waitingRooms[dept];
        const toProcess = Math.min(queue.length, Math.ceil(processRate / 3));

        for (let i = 0; i < toProcess; i++) {
          if (queue.length > 0 && Math.random() < 0.3) {
            const patient = queue.shift()!;
            hospital.totalQueueSize--;
            hospital.activeTreatments++;

            // Simulate discharge after treatment
            setTimeout(
              () => {
                hospital.activeTreatments = Math.max(
                  0,
                  hospital.activeTreatments - 1,
                );
                this.emitEvent({
                  id: generateId(),
                  type: "PATIENT_DISCHARGED",
                  timestamp: Date.now(),
                  data: {
                    patientId: patient.id,
                    hospitalId: hospital.id,
                    hospitalName: hospital.name,
                  },
                });
                this.state.stats = this.calculateStats(this.state.hospitals);
                this.onStateChange(this.state);
              },
              randomInt(5000, 15000),
            );
          }
        }
      });
    });

    // 3. Random distress events
    const distressChance = DISTRESS_CHANCE[this.config.distressFrequency];
    this.state.hospitals.forEach((hospital) => {
      (["NURSE", "GENERAL", "ICU"] as Department[]).forEach((dept) => {
        hospital.waitingRooms[dept].forEach((patient) => {
          if (Math.random() < distressChance && !patient.treating) {
            const oldPriority = patient.dynamicPriority;
            patient.distressScore += randomInt(2, 5);
            patient.dynamicPriority = Math.min(
              10,
              patient.baseSeverity + patient.distressScore,
            );

            this.emitEvent({
              id: generateId(),
              type: "DISTRESS_DETECTED",
              timestamp: Date.now(),
              data: {
                patientId: patient.id,
                hospitalId: hospital.id,
                hospitalName: hospital.name,
                oldPriority,
                newPriority: patient.dynamicPriority,
                distressScore: patient.distressScore,
              },
            });
          }
        });
      });
    });

    // 4. Redirections based on policy
    if (
      this.config.policyLogic !== "disabled" &&
      this.state.hospitals.length >= 2
    ) {
      this.state.hospitals.forEach((hospital) => {
        if (hospital.totalQueueSize > hospital.maxCapacity * 0.8) {
          // Find a less crowded hospital
          const candidates = this.state.hospitals.filter(
            (h) =>
              h.id !== hospital.id && h.totalQueueSize < h.maxCapacity * 0.5,
          );

          if (candidates.length > 0 && Math.random() < 0.1) {
            const targetHospital = randomChoice(candidates);
            const dept: Department = randomChoice(["NURSE", "GENERAL", "ICU"]);

            if (hospital.waitingRooms[dept].length > 0) {
              const patient = hospital.waitingRooms[dept].shift()!;
              hospital.totalQueueSize--;

              targetHospital.waitingRooms[dept].push(patient);
              targetHospital.totalQueueSize++;
              patient.targetHospitalId = targetHospital.id;

              this.emitEvent({
                id: generateId(),
                type: "REDIRECTION",
                timestamp: Date.now(),
                data: {
                  patientId: patient.id,
                  fromHospital: hospital.name,
                  toHospital: targetHospital.name,
                  fromHospitalId: hospital.id,
                  toHospitalId: targetHospital.id,
                  reason: "Capacity balancing",
                },
              });
            }
          }
        }
      });
    }

    // 5. Apply staff dropout effects
    if (
      this.config.staffDropoutPercent > 0 &&
      this.state.tickCount % 30 === 0
    ) {
      this.state.hospitals.forEach((hospital) => {
        if (Math.random() < this.config.staffDropoutPercent / 100) {
          hospital.activeDoctorCount = Math.max(
            1,
            hospital.activeDoctorCount - 1,
          );
        }
      });
    }

    // Update stats
    this.state.stats = this.calculateStats(this.state.hospitals);
    this.onStateChange(this.state);
  }

  // Get formatted stats for UI
  getFormattedStats() {
    const { stats, hospitals } = this.state;

    let totalQueue = 0;
    let avgWaitTime = 0;

    hospitals.forEach((h) => {
      totalQueue += h.totalQueueSize;
    });

    // Estimate avg wait time based on queue size and doctor count
    if (stats.totalDoctorsActive > 0) {
      avgWaitTime = Math.round((totalQueue / stats.totalDoctorsActive) * 5); // 5 min per patient per doctor
    }

    return {
      totalHospitals: stats.totalHospitals,
      totalPatients: stats.totalPatientsWaiting,
      avgQueueLength: hospitals.length > 0 ? totalQueue / hospitals.length : 0,
      avgWaitTime,
      surgeActive: stats.surgeActive,
    };
  }
}

// --- Singleton Instance ---
let engineInstance: SimulationEngine | null = null;

export function getSimulationEngine(
  onEvent: (event: SimulationEvent) => void,
  onStateChange: (state: SimulationState) => void,
): SimulationEngine {
  if (!engineInstance) {
    engineInstance = new SimulationEngine(onEvent, onStateChange);
  }
  return engineInstance;
}

export function resetSimulationEngine(): void {
  if (engineInstance) {
    engineInstance.reset();
    engineInstance = null;
  }
}
