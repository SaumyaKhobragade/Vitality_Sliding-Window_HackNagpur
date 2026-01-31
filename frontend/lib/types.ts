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