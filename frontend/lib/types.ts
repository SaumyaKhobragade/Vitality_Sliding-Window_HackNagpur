export interface Patient {
    id: string;
    severity: number;
    waitTime: string;
    status: string;
    priorityScore: number;
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

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL" | "SUCCESS" | "SYSTEM";
  message: string;
}
