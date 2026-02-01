/**
 * Video Distress Detection API Client
 * Connects to the Python FastAPI backend for video-based behavioral distress detection
 */

const VIDEO_API_BASE = "http://127.0.0.1:8001";

export interface DistressEvent {
    eventId: string;
    signalType: string;
    confidence: number;
    zone: string;
    timestamp: string;
    blobId: number;
}

export interface AnalysisResponse {
    events: DistressEvent[];
    framesAnalyzed: number;
    duration: number;
    message: string;
}

export interface VideoInfo {
    name: string;
    path: string;
    expectedSignal: string;
    isDistress: boolean; // True if this video contains a distress scenario
}

// Sample videos available for analysis
export const SAMPLE_VIDEOS: VideoInfo[] = [
    { name: "Waiting Area A", path: "clip_01_baseline.mp4", expectedSignal: "BASELINE", isDistress: false },
    { name: "Waiting Area B", path: "clip_02_immobility.mp4", expectedSignal: "PROLONGED_IMMOBILITY", isDistress: true },
    { name: "Waiting Area C", path: "clip_03_bending.mp4", expectedSignal: "REPEATED_BENDING", isDistress: true },
    { name: "Waiting Area D", path: "clip_04_collapse.mp4", expectedSignal: "SUDDEN_COLLAPSE", isDistress: true },
    { name: "Waiting Area E", path: "clip_05_crowd.mp4", expectedSignal: "CROWD_FORMATION", isDistress: true },
    { name: "Waiting Area F", path: "clip_06_stable.mp4", expectedSignal: "SUDDEN_COLLAPSE", isDistress: true },
];

// Get only distress videos for initial display
export const DISTRESS_VIDEOS = SAMPLE_VIDEOS.filter(v => v.isDistress);

/**
 * Analyze a video from local path
 */
export async function analyzeLocalVideo(videoPath: string): Promise<AnalysisResponse> {
    const response = await fetch(`${VIDEO_API_BASE}/analyze-local?video_path=${encodeURIComponent(videoPath)}`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(`Video analysis failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Analyze a video file via upload
 */
export async function analyzeVideo(file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch(`${VIDEO_API_BASE}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Video analysis failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get all stored distress events
 */
export async function getDistressEvents(): Promise<DistressEvent[]> {
    const response = await fetch(`${VIDEO_API_BASE}/events`);

    if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return response.json();
}

/**
 * Clear all stored events
 */
export async function clearDistressEvents(): Promise<void> {
    const response = await fetch(`${VIDEO_API_BASE}/events`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to clear events: ${response.status}`);
    }
}

/**
 * Check video backend health
 */
export async function checkVideoBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${VIDEO_API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get signal type display info
 */
export function getSignalInfo(signalType: string): { color: string; bgColor: string; borderColor: string; label: string } {
    switch (signalType) {
        case "SUDDEN_COLLAPSE":
            return {
                color: "text-red-700 dark:text-red-300",
                bgColor: "bg-red-100 dark:bg-red-900/40",
                borderColor: "border-red-200 dark:border-red-800",
                label: "COLLAPSE"
            };
        case "PROLONGED_IMMOBILITY":
            return {
                color: "text-orange-700 dark:text-orange-300",
                bgColor: "bg-orange-100 dark:bg-orange-900/40",
                borderColor: "border-orange-200 dark:border-orange-800",
                label: "IMMOBILE"
            };
        case "REPEATED_BENDING":
            return {
                color: "text-yellow-700 dark:text-yellow-300",
                bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
                borderColor: "border-yellow-200 dark:border-yellow-800",
                label: "BENDING"
            };
        case "ERRATIC_PACING":
            return {
                color: "text-purple-700 dark:text-purple-300",
                bgColor: "bg-purple-100 dark:bg-purple-900/40",
                borderColor: "border-purple-200 dark:border-purple-800",
                label: "PACING"
            };
        case "CROWD_FORMATION":
            return {
                color: "text-blue-700 dark:text-blue-300",
                bgColor: "bg-blue-100 dark:bg-blue-900/40",
                borderColor: "border-blue-200 dark:border-blue-800",
                label: "CROWD"
            };
        case "BASELINE":
            return {
                color: "text-green-700 dark:text-green-300",
                bgColor: "bg-green-100 dark:bg-green-900/40",
                borderColor: "border-green-200 dark:border-green-800",
                label: "NORMAL"
            };
        case "STABLE":
            return {
                color: "text-green-700 dark:text-green-300",
                bgColor: "bg-green-100 dark:bg-green-900/40",
                borderColor: "border-green-200 dark:border-green-800",
                label: "STABLE"
            };
        default:
            return {
                color: "text-gray-700 dark:text-gray-300",
                bgColor: "bg-gray-100 dark:bg-gray-800",
                borderColor: "border-gray-200 dark:border-gray-700",
                label: signalType
            };
    }
}
